const {ApolloServer, gql} = require('apollo-server');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
    type Geschichten {
        titel: String
        ort: String
        typ: String
        geo: [Float]
        startzeit: String
        endzeit: String
        geschichte: String
        folge: String
        folgenname: String
        code: String
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
        folge: String
        folgenname: String
        code: String
    }

    type Folge {
        folge: String
        folgenname: String
        code: String
        staedtegeschichten: Staedtegeschichten
        mathefacts: Mathefacts
    }

    # The "Query" type is special: it lists all of the available queries that
    # clients can execute, along with the return type for each. In this
    # case, the "folgen" query returns an array of zero or more Folge (defined above).
    type Query {
        folgen: [Folge]
        staedtegeschichten: [Geschichten]
        mathefacts: [Mathefacts]
    }
`;
const JsonData = require('./data.json')

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "folgen" array above.
const resolvers = {
    Query: {
        folgen: () => JsonData.data,
        staedtegeschichten(parent, args, context, info) {
            let geschichten = []
            JsonData.data.forEach((folge) => {
                if (typeof folge.staedtegeschichten !== 'undefined') {
                    folge.staedtegeschichten.geschichten.forEach((geschichte) => {
                        geschichten.push(Object.assign(geschichte, {"startzeit": folge.staedtegeschichten.startzeit},{"endzeit": folge.staedtegeschichten.endzeit}, {"folge": folge.folge}, {"folgenname": folge.folgenname}, {"code": folge.code}))
                    })
                }
            });
            return geschichten
        },
        mathefacts(parent, args, context, info) {
            let mathefacts = []
            JsonData.data.forEach((folge) => {
                if (typeof folge.mathefacts !== 'undefined') {
                        mathefacts.push(Object.assign(folge.mathefacts, {"folge": folge.folge}, {"folgenname": folge.folgenname}, {"code": folge.code}))
                }
            });
            return mathefacts
        }
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