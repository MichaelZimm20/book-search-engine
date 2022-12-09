// import models 
const { User } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

// resolver 
const resolvers = {
    // query type: me 
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')

                return userData;
            }

            // throw authentication if user is not loggedin
            throw new AuthenticationError('Not logged in !');
        },
    },

    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            // athenticate if user provides correct email credentials
            if (!user) {
                throw new AuthenticationError('Incorrect credentials!');
            }

            // authenticate to see if password is correct 
            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect password credentials!');
            }

            // assign user logged in token
            const token = signToken(user);
            return { token, user };
        },

        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (parent, { input }, context) => {
            const id = context.user._id;
            if (context.user) {
                const savedBookInputs = await User.findByIdAndUpdate(
                    { _id: id },
                    { $addToSet: { savedBooks: input } },
                    { new: true }
                );
                return savedBookInputs;
            }

            throw new AuthenticationError('Incorrect credentials!');
        },

        removeBook: async (parent, { bookId }, context) => {
            const id = context.user._id;
            console.log(id, bookId)
            if (context.user) {
                const removeTheBook = await User.findOneAndUpdate(
                    { _id: id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
                return removeTheBook;
            }

            throw new AuthenticationError('Incorrect credentials, please log in!');
        }
    }
};

// export resolvers
module.exports = resolvers;