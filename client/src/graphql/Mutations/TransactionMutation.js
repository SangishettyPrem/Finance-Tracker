import { gql } from "@apollo/client";

export const ADD_TRANSACTION = gql`
    mutation AddTransaction($userId: ID!,$input: TransactionInput!){
        addTransaction(userId: $userId, input: $input){
            message
            success
            transaction{
                _id
                type
                description
                date
                amount
            }
        }
    }
`;