const graphQL = require('graphql');
const _ = require('lodash');

// Models
const Book = require('../models/book');
const Author = require('../models/author');

// define schema
// - How the data looks like
// - What are the relations between the data

const { // grab this object from package
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull
} = graphQL;

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    /**
     * The reason why fields is a function is that BookType is not
     * yet defined. If we were to use an object instead, it will fail because
     * BookType is defined later. With a function, we are postponing the execution
     * till later when all types are known.
     */
    fields: () => ({
        id: {
            type: GraphQLString
        },
        name: {
            type: GraphQLString
        },
        age: {
            type: GraphQLInt
        },
        books: {
            type: new GraphQLList(BookType),
            /**
             * parent is the author object retrieved from the query below
             */
            resolve(parent, args) {
                // return _.filter(books, { authorId: parent.id });
                return Book.find({
                    authorId: parent.id
                });
            }
        }
    }), // return object
});

const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: {
            type: GraphQLString
        },
        name: {
            type: GraphQLString
        },
        genre: {
            type: GraphQLString
        },
        author: {
            type: AuthorType,
            /**
             * parent is the book object retrieved from the query below
             */
            resolve(parent, args) {
                // console.log(parent);
                //return _.find(authors, { id: parent.authorId });
                return Author.findById(parent.authorId);
            }
        }
    }), // return object
});

// How we initially jump into the graph
// My top-level query object returns a `RootQueryType` object,

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        book: {
            type: BookType,
            args: {
                id: {
                    type: GraphQLID
                }
            },
            resolve(parent, args) {
                // code to get data from db / other source
                // args.id 
                // return _.find(books, {
                //     id: args.id
                // });
                return Book.findById(args.id);
            }
        },
        author: {
            type: AuthorType,
            args: {
                id: {
                    type: GraphQLID
                }
            },
            resolve(parent, args) {
                // return _.find(authors, {
                //     id: args.id
                // });
                return Author.findById(args.id);
            }
        },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args) {
                // return books;
                return Book.find({});
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent, args) {
                // return authors;
                return Author.find({});
            }
        },
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addAuthor: {
            type: AuthorType,
            args: {
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                age: {
                    type: new GraphQLNonNull(GraphQLInt)
                }
            },
            resolve(parent, args) {
                let author = new Author({
                    name: args.name,
                    age: args.age
                });
                return author.save(); // save model to database
            }
        },
        addBook: {
            type: BookType,
            args: {
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                genre: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                authorId: {
                    type: new GraphQLNonNull(GraphQLID)
                }
            },
            resolve(parent, args) {
                let book = new Book({
                    name: args.name,
                    genre: args.genre,
                    authorId: args.authorId
                });
                return book.save(); // save model to database
            }
        },
        updateBook: {
            type: BookType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLID)
                },
                name: {
                    type: GraphQLString
                },
                genre: {
                    type: GraphQLString
                },
                authorId: {
                    type: GraphQLID
                }
            },
            resolve(parent, args) {
                if (!args.id) return;

                const book = Book.findById(args.id);
                book.name = args.name;

                return Book.findOneAndUpdate({
                        _id: args.id
                    }, {
                        $set: {
                            name: args.name,
                            genre: args.genre,
                            authorId: args.authorId
                        }
                    }, {
                        new: true
                    },
                    // the callback function
                    (err, book) => {
                        if (err) {
                            console.log("Something wrong when updating data!");
                        }

                        console.log(book);
                    });
            }
        }, // end updateBook
        deleteBook: {
            type: BookType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLID)
                }
            },
            resolve(parent, args) {
                if (!args.id) return;

                const book = Book.findById(args.id);
                
                return Book.findByIdAndDelete(
                    args.id,
                    // the callback function
                    (err, book) => {
                        if (err) {
                            console.log("Something wrong when deleting data!");
                        }

                        console.log(book);
                    });
            }
        }, // end deleteBook
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})
