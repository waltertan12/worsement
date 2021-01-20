import OAuth2Strategy, { VerifyCallback } from 'passport-oauth2';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import promBundle from 'express-prom-bundle';
import session from 'express-session';
import { Application } from 'express';

interface MemoryStore {
    [key: number]: {
        refreshToken: string;
        accessToken?: string;
    };
}

export const memoryStore: MemoryStore = {};

// OAuth strategies
const alpacaOAuthStrategy = new OAuth2Strategy(
    {
        authorizationURL: 'https://app.alpaca.markets/oauth/authorize',
        tokenURL: 'https://api.alpaca.markets/oauth/token',
        clientID: process.env.APCA_OAUTH2_CLIENT_ID as string,
        clientSecret: process.env.APCA_OAUTH2_CLIENT_SECRET as string,
        callbackURL: 'http://localhost:3001/auth/alpaca/callback',
    },
    (accessToken: string, refreshToken: string, profile: undefined, cb: VerifyCallback): void => {
        console.log({ status: 'OAuthed', accessToken, refreshToken, profile });
        memoryStore[0] = { accessToken, refreshToken };
        return cb(null, { accessToken, refreshToken, profile });
    },
);
alpacaOAuthStrategy.name = 'alpaca-oauth2';

passport.use(alpacaOAuthStrategy);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export const applyMiddleware = (app: Application): Application => {
    app.use(promBundle({ includeMethod: true, includePath: true, promClient: { collectDefaultMetrics: {} } }));
    app.use(compression());
    app.use(cors());
    app.use(express.json());
    app.use(helmet());
    app.use(morgan('common'));
    app.use(
        session({
            secret: process.env.SESSION_SECRET ?? '',
            resave: true,
        }),
    );
    app.use(passport.initialize());
    app.use(passport.session());

    return app;
};
