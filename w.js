const { SerialPort } = require("serialport");
const { DelimiterParser } = require("@serialport/parser-delimiter");
const express = require("express");

const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://aragonpaezjaime:7ygv9ijn@cluster0.y0ukf6q.mongodb.net/Sensores?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    }
  )
  .then(console.log("conectado"));
const tourSchema = new mongoose.Schema({
  nombre: {
    type: String,
    require: [true, "debe tener un nombre"],
  },
  estado: {
    type: String,
  },
  topico: {
    type: String,
  },
  tipo: {
    type: String,
  },
});
const Tour = mongoose.model("casa2", tourSchema);
const testTour = new Tour({
  nombre: "luz 2",
  estado: "off",
  topico: "casa/recamara",
  tipo: "interruptor",
});

testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log("Error", err);
  });
const app = express();
const parser = new DelimiterParser({ delimiter: "\n" });
const config = {
  path: "/dev/ttyUSB0",
  baudRate: 9600,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
  autoOpen: false,
};
const port = new SerialPort(config);
port.open((err) => {
  if (err) {
    console.log("error opening the port");
  }
  port.write(`\n`);
});

function tryParseJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return JSON.parse(str);
}

port.pipe(parser);
parser.on("data", (data) => {
  const datos = tryParseJson(data);
  console.log(`Minutos:${datos.minutos} Segundos:${datos.segundos}`);
});
app.get("/on", (req, res) => {
  port.write(`A\n`);
  res.status(200).send("Led encendido");
});
app.get("/off", (req, res) => {
  port.write(`B\n`);
  res.status(200).send("Led apagado");
});
const portnum = 3000;
app.listen(portnum, () => {
  console.log("listen");
});
