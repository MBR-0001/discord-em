import Discord from "discord.js";
import "dotenv/config";
if (!process.env.TOKEN) {
    console.error("TOKEN not found");
    process.exit(1);
}
// perms 274878171136
const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_EMOJIS_AND_STICKERS"]
});
client.login(process.env.TOKEN).catch(console.error);
client.once("ready", async () => {
    if (!client.application) {
        console.error("No application found");
        process.exit(1);
    }
    const cmds = await client.application?.commands.fetch().catch(console.error);
    if (!cmds) {
        console.error("No commands found");
        process.exit(1);
    }
    if (!cmds.find(x => x.name == "em")) {
        client.application.commands.create({
            name: "em",
            description: "Emoji!",
            type: "CHAT_INPUT",
            defaultPermission: true,
            options: [
                {
                    name: "emoji",
                    type: "STRING",
                    description: "The emoji to use",
                    autocomplete: true,
                    required: true
                }
            ]
        }).catch(console.error);
    }
    console.log("Ready " + client.user?.tag);
});
client.on("interactionCreate", (interaction) => {
    const error = (text) => {
        if (interaction.isCommand()) {
            interaction.reply({
                content: text,
                ephemeral: true
            });
        }
        else if (interaction.isAutocomplete()) {
            interaction.respond([]);
        }
    };
    if ((!interaction.isCommand() && !interaction.isAutocomplete()) || interaction.commandName != "em") {
        return error("Invalid command");
    }
    const opt = interaction.options.get("emoji");
    if (!opt)
        return error("No option found");
    const val = String(opt.value) || "";
    if (interaction.isAutocomplete()) {
        if (!interaction.guild?.id) {
            return error("This command can only be used in guilds");
        }
        const f = (x) => x.name != undefined && (x.name && x.animated || x.guild.id != interaction.guild.id) && x.name.toLowerCase().includes(val.toLowerCase());
        const e = [...interaction.client.emojis.cache.values()].filter(f).slice(0, 25);
        return interaction.respond(e.map(x => ({ name: x.name, value: x.id })));
    }
    const e = interaction.client.emojis.cache.get(val) ?? interaction.client.emojis.cache.find(x => x.name == val);
    if (!e)
        return error("Invalid emoji provided");
    return interaction.reply(e.toString());
});
