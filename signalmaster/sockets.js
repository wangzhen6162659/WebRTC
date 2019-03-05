var socketIO = require('socket.io'),
    uuid = require('node-uuid'),
    crypto = require('crypto');

module.exports = function (server, config) {

    var io = socketIO.listen(server);
    io.sockets.on('connection', function (client) {
        // console.log(client)
        client.resources = {
            screen: false,
            video: true,
            audio: false,
        };

        // pass a message to another id
        client.on('message', function (details) {
            if (!details) return;

            var otherClient = io.to(details.to);
            if (!otherClient) return;

            details.from = client.id;
            details.config = client.config;
            otherClient.emit('message', details);
        });

        client.on('shareScreen', function () {
            client.resources.screen = true;
        });

        client.on('unshareScreen', function (type) {
            client.resources.screen = false;
            removeFeed('screen');
        });

        client.on('join', join);

        function removeFeed(type) {
            if (client.room) {
                io.sockets.in(client.room).emit('remove', {
                    id: client.id,
                    type: type
                });
                if (!type) {
                    client.leave(client.room);
                    client.room = undefined;
                }
            }
        }

        function join(name, cb) {
            console.log(client.config)
            if (typeof name !== 'string') return;
            if (config.rooms && config.rooms.maxClients > 0 &&
                clientsInRoom(name) >= config.rooms.maxClients) {
                safeCb(cb)('full');
                return;
            }
            removeFeed();
            safeCb(cb)(null, describeRoom(name));
            client.join(name);
            client.room = name;
        }

        client.on('getMine', function (sid,userId,cb) {
            client.config = {
                userId: userId
            };
            safeCb(cb)(null, getClientBySid(sid));
        });

        client.on('disconnect', function () {
            removeFeed();
        });
        client.on('leave', function () {
            removeFeed();
        });

        client.on('create', function (name, cb) {
            if (arguments.length == 2) {
                cb = (typeof cb == 'function') ? cb : function () {};
                name = name || uuid();
            } else {
                cb = name;
                name = uuid();
            }
            // check if exists
            var room = io.nsps['/'].adapter.rooms[name];
            if (room && room.length) {
                safeCb(cb)('taken');
            } else {
                join(name);
                safeCb(cb)(null, name);
            }
        });

        client.on('trace', function (data) {
            console.log('trace', JSON.stringify(
            [data.type, data.session, data.prefix, data.peer, data.time, data.value]
            ));
        });

        client.emit('stunservers', config.stunservers || []);

        var credentials = [];
        var origin = client.handshake.headers.origin;
        if (!config.turnorigins || config.turnorigins.indexOf(origin) !== -1) {
            config.turnservers.forEach(function (server) {
                credentials.push({
                    username: server.username,
                    credential: server.credential,
                    urls: server.urls || server.url
                });
            });
        }
        client.emit('turnservers', credentials);
    });

    function describeRoom(name) {
        var adapter = io.nsps['/'].adapter;

        var clients = adapter.rooms[name] || {};
        var result = {
            clients: {}
        };

        if(clients.length>0) {
            var a = clients.sockets;
            Object.keys(a).forEach(function (id) {
                result.clients[id] = {
                    resources: adapter.nsp.connected[id].resources,
                    config: adapter.nsp.connected[id].config
                }
            })
        }
        return result;
    }

    function clientsInRoom(name) {
        return io.sockets.clients(name).length;
    }

    function getClientBySid(sid){
        var adapter = io.nsps['/'].adapter;
        var client;
        client = {
            resources: adapter.nsp.connected[sid].resources,
            config: adapter.nsp.connected[sid].config
        }
        return client;
    }
};

function safeCb(cb) {
    if (typeof cb === 'function') {
        return cb;
    } else {
        return function () {};
    }
}
