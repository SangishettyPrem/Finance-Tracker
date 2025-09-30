import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import type { Express } from "express";
import { isAuthenticated } from "@/middlewares/authMiddleware.js";
import { SampleSchema } from "@/GraphQL/schema/sampleSchema.js";
import { TransactionSchema } from "@/GraphQL/schema/transaction.schema.js";
import { TransactionResolvers } from "@/GraphQL/resolvers/transaction.resolvers.js";
import { sampleResolvers } from "@/GraphQL/resolvers/sampleResolvers.js";

export const connectGraphQL = async (app: Express) => {
  const server = new ApolloServer({
    typeDefs: [SampleSchema, TransactionSchema],
    resolvers: [sampleResolvers, TransactionResolvers],
    introspection: false,
  });
  await server.start();
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const auth = await isAuthenticated({ req, res });
        if (auth.message) {
          throw new Error(auth.message);
        }
        return auth;
      },
    })
  );
  return server;
};
