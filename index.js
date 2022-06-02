const {ApolloServer, gql} = require('apollo-server');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
    type Geschichten {
        titel: String
        ort: String
        geschichte: String
        typ: String
        geo: [Float]
    }

    type Staedtegeschichten {
        startzeit: String
        endzeit: String
        geschichten: [Geschichten]
    }

    type Mathefacts {
        startzeit: String
        endzeit: String
        thema: String
        beschreibung: String
    }

    type Folge {
        folge: String
        name: String
        code: String
        staedtegeschichten: Staedtegeschichten
        mathefacts: Mathefacts
    }

    # The "Query" type is special: it lists all of the available queries that
    # clients can execute, along with the return type for each. In this
    # case, the "folgen" query returns an array of zero or more Folge (defined above).
    type Query {
        folgen: [Folge]
    }
`;
const JsonData = require('./data.json')

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "folgen" array above.
const resolvers = {
    Query: {
        folgen: () => JsonData.data
    }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
});

// The `listen` method launches a web server.
server.listen().then(({url}) => {
    console.log(`🚀  Server ready at ${url}`);
});