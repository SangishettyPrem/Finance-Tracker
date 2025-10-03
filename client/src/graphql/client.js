import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client"
import { ErrorLink } from "@apollo/client/link/error";
import api from "../api/api";
import { CombinedGraphQLErrors, CombinedProtocolErrors } from "@apollo/client/errors"
import { Observable } from "@apollo/client/core"
import { GraphQLError } from "graphql";
import { handleErrorResponse } from "../utils/handleResponse";

const refreshToken = async () => {
    try {
        return await api.post('/api/auth/v1/refresh', {}, { withCredentials: true });
    } catch (error) {
        return Promise.reject(error);
    }
}
const access_token = localStorage.getItem('access_token');

const httpLink = new HttpLink({
    uri: import.meta.env.VITE_BACKEND_URL + "/graphql",
    credentials: "include",
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + access_token
    }
});

const errorLink = new ErrorLink(({ error, operation, forward }) => {
    if (CombinedGraphQLErrors.is(error)) {
        return new Observable(subscriber => {
            let handled = false;
            error.errors.forEach(err => {
                if (err.extensions?.code === "UNAUTHENTICATED" && !handled) {
                    handled = true; // prevent multiple retries
                    refreshToken()
                        .then(res => {
                            if (res.data?.success) {
                                forward(operation).subscribe(subscriber);
                            } else {
                                subscriber.error(
                                    new GraphQLError(res.data?.message || "Session expired. Please log in again.")
                                );
                            }
                        })
                        .catch(refreshErr => {
                            subscriber.error(
                                new GraphQLError(
                                    refreshErr?.response?.data?.message ||
                                    refreshErr?.message ||
                                    "Session expired. Please log in again."
                                )
                            );
                        });
                }
            });

            if (!handled) {
                // no retry case → just pass error
                subscriber.error(error);
            }
        });
    } else if (CombinedProtocolErrors.is(error)) {
        error.errors.forEach(({ message, extensions }) => {
            handleErrorResponse(message + '.' + extensions?.code);
        }

        );
    } else {
        handleErrorResponse(error.message);
    }
});


const client = new ApolloClient({
    link: ApolloLink.from([errorLink, httpLink]),
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    getTransactions: {
                        keyArgs: ["limit", "page", "type", "category", "search"],
                        merge(existing = { transactions: [] }, incoming, { args }) {
                            const merged = args.page = 1
                                ? incoming.transactions
                                : {
                                    ...existing,
                                    transactions: [...existing.transactions, ...incoming.transactions],
                                };
                            return {
                                ...incoming,
                                transactions: merged,
                            };
                        }
                    }
                }
            }
        }
    }),
});

export default client;