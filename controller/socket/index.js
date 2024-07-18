module.exports = () => {
    global.io.on("connection", (socket) => {
        // console.log('socket? =>', socket)
        global.io.emit(`updatesocket`, { data: socket.id });
        console.log('connected user-----', socket.id)

        socket.on("disconnect", async () => {
            console.log("disconnected", socket.id)
        });

    })
}