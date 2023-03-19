import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import path from 'path';
import serveIndex from 'serve-index';
import express from 'express';

// import { uWebSocketsTransport} from "@colyseus/uwebsockets-transport";

// Import demo room handlers
import { LobbyRoom, RelayRoom } from 'colyseus';
import { ChatRoom } from "./rooms/01-chat-room";
import { UpdatedChatRoom } from "./rooms/updated-chat-room";
import { StateHandlerRoom } from "./rooms/02-state-handler";
import { AuthRoom } from "./rooms/03-auth";
import { ReconnectionRoom } from './rooms/04-reconnection';
import { CustomLobbyRoom } from './rooms/07-custom-lobby-room';
import { MatterjsRoom } from './rooms/matterjs';
import { MatterjsPlatformRoom } from "./rooms/matterjs-platform";
import { GameRoom as GameRoomV1 } from "./rooms/circle-io-v1";
import { GameRoom as GameRoomV2 } from "./rooms/circle-io-v2";
import { GameRoom as DiepRoomV1 } from "./rooms/diep-io-v1";
import { GameRoom as DiepRoomV2 } from "./rooms/diep-io-v2";
import { GameRoom as DiepRoomV2Hybrid } from "./rooms/diep-io-v2-hybrid";
import { GameRoom as BattleRoom } from "./rooms/battle-io"

export default Arena({
    getId: () => "Your Colyseus App",

    // initializeTransport: (options) => new uWebSocketsTransport(options),

    initializeGameServer: (gameServer) => {
        // Define "lobby" room
        gameServer.define("lobby", LobbyRoom);

        // Define "relay" room
        gameServer.define("relay", RelayRoom, { maxClients: 4 }).enableRealtimeListing();

        // Define "chat" room
        gameServer.define("chat", ChatRoom).enableRealtimeListing();

        gameServer.define("updatedChat", UpdatedChatRoom).enableRealtimeListing();

        gameServer.define("circle_io_v1", GameRoomV1).enableRealtimeListing();

        gameServer.define("circle_io_v2", GameRoomV2).enableRealtimeListing();


        gameServer.define("diep_io_v1", DiepRoomV1).enableRealtimeListing();

        gameServer.define("diep_io_v2", DiepRoomV2).enableRealtimeListing();

        gameServer.define("diep_io_v2-hybrid", DiepRoomV2Hybrid).enableRealtimeListing();

        gameServer.define("battle_io", BattleRoom).enableRealtimeListing


        // Register ChatRoom with initial options, as "chat_with_options"
        // onInit(options) will receive client join options + options registered here.
        gameServer.define("chat_with_options", ChatRoom, {
            custom_options: "you can use me on Room#onCreate"
        });

        // Define "state_handler" room
        gameServer.define("state_handler", StateHandlerRoom).enableRealtimeListing();

        // Define "auth" room
        gameServer.define("auth", AuthRoom).enableRealtimeListing();

        // Define "reconnection" room
        gameServer.define("reconnection", ReconnectionRoom).enableRealtimeListing();

        // Define "custom_lobby" room
        gameServer.define("custom_lobby", CustomLobbyRoom);

        gameServer.define("matterjs", MatterjsRoom).filterBy(['gamePIN']);

        // gameServer.define("phaserjs", PhaserRoom).filterBy(['gamePIN']);

        gameServer.define("matterjsplatform", MatterjsPlatformRoom).filterBy(['gamePIN']);

        gameServer.onShutdown(function () {
            console.log(`game server is shutting down.`);
        });

    },

    initializeExpress: (app) => {
        app.use('/', serveIndex(path.join(__dirname, "static"), { 'icons': true }))
        app.use('/', express.static(path.join(__dirname, "static")));

        // app.use(serveIndex(path.join(__dirname, "static"), {'icons': true}))
        // app.use(express.static(path.join(__dirname, "static")));

        // (optional) attach web monitoring panel
        app.use('/colyseus', monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
