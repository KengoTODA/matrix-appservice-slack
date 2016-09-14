"use strict";

var AdminCommand = require("./AdminCommand");

var adminCommands = {};

adminCommands.help = AdminCommand.makeHelpCommand(adminCommands);

adminCommands.list = new AdminCommand({
    desc: "list the linked rooms",
    func: function(bridge, args, respond) {
        bridge._rooms.forEach((room) => {
            var matrix_room_ids = room.getMatrixRoomIds();

            var slack_channel_id = room.getSlackChannelId();
            var slack_channel_name = room.getSlackChannelName();

            var slack = slack_channel_name
                ? slack_channel_name + "(" + slack_channel_id + ")"
                : "UNKNOWN(" + slack_channel_id + ")";

            if (!matrix_room_ids.length) {
                respond("BridgedRoom " + slack + " unlinked");
            }
            else if (matrix_room_ids.length == 1) {
                respond("BridgedRoom " + slack + " -r=" + matrix_room_ids[0]);
            }
            else {
                respond("BridgedRoom " + slack + " linked:");
                matrix_room_ids.forEach((id) => respond(" -r=" + id));
            }
        });
    },
});

adminCommands.link = new AdminCommand({
    desc: "connect a Matrix and a Slack room together",
    opts: {
        "channel|c": "Slack channel ID",
        "room|r": "Matrix room ID",
        "?webhook_url|u": "Slack webhook URL",
        "?token|t": "Slack webhook token",
    },
    func: function(bridge, opts, args, respond) {
        bridge.actionLink({
            matrix_room_id: opts.room,
            slack_channel_id: opts.channel,
            slack_token: opts.token,
            slack_webhook_uri: opts.webhook_url,
        }).then(
            ()  => { respond("Linked") },
            (e) => { respond("Cannot link - " + e ) }
        );
    },
});

adminCommands.unlink = new AdminCommand({
    desc: "disconnect a linked Matrix and Slack room",
    opts: {
        "channel|c": "Slack channel ID",
        "room|r": "Matrix room ID",
    },
    func: function(bridge, opts, args, respond) {
        bridge.actionUnlink({
            matrix_room_id: opts.room,
            slack_channel_id: opts.channel,
        }).then(
            ()  => { respond("Unlinked") },
            (e) => { respond("Cannot unlink - " + e) }
        );
    },
});

module.exports = adminCommands;