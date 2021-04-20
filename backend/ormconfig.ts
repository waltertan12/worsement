const rootDir = (process.env.TS_NODE ? '' : 'dist/');

module.exports = {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
    synchronize: false,
    logging: 'error',
    entities: [rootDir + 'src/entity/**/*.{ts,js}'],
    migrations: [rootDir + 'src/migration/**/*.{ts,js}'],
    subscribers: [rootDir + 'src/subscriber/**/*.{ts,js}'],
    cli: {
        entitiesDir: rootDir + 'src/entity',
        migrationsDir: rootDir + 'src/migration',
        subscribersDir: rootDir + 'src/subscriber',
    },
};