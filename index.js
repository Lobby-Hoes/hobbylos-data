import express from 'express';
import {ApolloServer, gql} from 'apollo-server-express';
import fs from 'fs';
import https from 'https';
import http from 'http';
import {createRequire} from "module";

const require = createRequire(import.meta.url);
const folgenJson = require('./folgen.json')
const mathefactsJson = require('./mathefacts.json')
const staedtegeschichtenJson = require('./staedtegeschichten.json')
const playlistJson = require('./playlist.json')
const lexikonJson = require('./lexikon.json')

const typeDefs = gql`
    type songs {
        code: String!
        draufgepackt: String!
    }

    type Playlist {
        folgenId: ID!
        startzeit: String!
        songs: [songs]!
    }

    type Geschichte {
        titel: String!
        ort: String!
        typ: String!
        geo: [Float]!
        geschichte: String!
    }

    type Staedtegeschichten {
        startzeit: String!
        endzeit: String!
        geschichten: [Geschichte]!
        folge: Folge!
    }

    type Mathefacts {
        startzeit: String!
        endzeit: String!
        thema: String!
        beschreibung: String!
        folge: Folge!
    }

    type Folge {
        folgenId: ID!
        folgenname: String!
        code: String!
    }

    # Close Words is a string to prevent infinite recursion
    type Word {
        word: String!
        type: String!
        explanation: String!
        examples: [String]!
        closeWords: [String]!
    }

    # The "Query" type is special: it lists all of the available queries that
    # clients can execute, along with the return type for each. In this
    # case, the "folgen" query returns an array of zero or more Folge (defined above).
    type Query {
        folgen: [Folge]
        staedtegeschichten: [Staedtegeschichten]
        mathefacts: [Mathefacts]
	    playlist: [Playlist]
        word(filter: WordFilter): [Word]
    }

    input WordFilter {
        word_contains: String
    }
`;

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "folgen" array above.
const resolvers = {
    Query: {
        playlist: () => playlistJson.data,
        folgen: () => folgenJson.data,
        staedtegeschichten(parent, args, context, info) {
            let geschichten = []
            const folgen = folgenJson.data
            staedtegeschichtenJson.data.forEach((staedtegeschichtenFolge) => {
                const folgeObj = folgen.find(item => item.folgenId === staedtegeschichtenFolge.folgenId)
                geschichten.push(Object.assign(staedtegeschichtenFolge, {"folge": folgeObj}
                    )
                )
            });
            return geschichten
        },
        mathefacts(parent, args, context, info) {
            let facts = []
            const folgen = folgenJson.data
            mathefactsJson.data.forEach((mathefactsFolge) => {
                const folgeObj = folgen.find(item => item.folgenId === mathefactsFolge.folgenId)
                facts.push(Object.assign(mathefactsFolge, {"folge": folgeObj}
                    )
                )
            });
            return facts
        },
        word(parent, args, context, info) {
	    let words = lexikonJson.data;
	    if (args.filter && args.filter.word_contains) {
	        const filterLowerCase = args.filter.word_contains.toLowerCase();
	        words = words.filter(word => word.word.toLowerCase().includes(filterLowerCase));
	    }
	    return words;
	}
    }
};
async function startApolloServer() {
    const configurations = {
        production: {ssl: true, port: 443, hostname: 'data.hobbylos.online'},
        development: {ssl: false, port: 4000, hostname: 'localhost'},
    };
    const environment = process.env.NODE_ENV || 'production';
    const config = configurations[environment];

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        csrfPrevention: true,
    });
    await server.start();
    const app = express();
    server.applyMiddleware({app});
    let httpServer;
    if (config.ssl) {httpServer = https.createServer({key: fs.readFileSync(`./ssl/server.key`),cert: fs.readFileSync(`./ssl/server.crt`),},app,);}
    else {httpServer = http.createServer(app);}
    await new Promise(resolve =>httpServer.listen({port: config.port}, resolve),);
    console.log(
        '🚀 Server ready at',
        `http${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${
            server.graphqlPath
        }`,
    );
    return {server, app};
}
startApolloServer()
