const { St, GLib, Clutter, Soup } = imports.gi;
const ByteArray = imports.byteArray;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Config = Extension.imports.config;

let panelButton, panelButtonText, timeout;

const CURL = `curl 'https://app-money.tmx.com/graphql' -X POST -H 'content-type: application/json' --compressed --data '{"operationName":"getQuoteBySymbol","variables":{"symbol":"%SYMBOL%","locale":"en"},"query":"query getQuoteBySymbol($symbol: String, $locale: String){getQuoteBySymbol(symbol: $symbol, locale: $locale) {\\nsymbol\\nname\\nprice\\npriceChange\\npercentChange}}"}'`;

function getStockValue(ticker, quantity) {
  cmd = CURL.replace("%SYMBOL%", ticker);
  var [ok, out, err, exit] = GLib.spawn_command_line_sync(cmd);
  if (out.length > 0) {
    return (
      Math.round(
        +ByteArray.toString(out).replace("\n", "").slice(92, 97) *
          quantity *
          100
      ) / 100
    );
  } else {
    return 0.0;
  }
}

function setButtonText() {
  printerr("[GNOME FINANCE] *********************************************");

  let totalVal = 0.0;
  for (let i = 0; i < Config.stocks().length; i++) {
    totalVal += getStockValue(Config.stocks()[i][0], Config.stocks()[i][1]);
  }

  totalVal += Config.cash();

  output = "$" + totalVal;
  panelButtonText.set_text(output);

  printerr("[GNOME FINANCE] *********************************************");
}

function init() {
  panelButton = new St.Bin({});
  panelButtonText = new St.Label({
    text: "Init...",
    y_align: Clutter.ActorAlign.CENTER,
  });
  panelButton.set_child(panelButtonText);
}

function enable() {
  Main.panel._rightBox.insert_child_at_index(panelButton, 1);
  setButtonText();
  timeout = Mainloop.timeout_add_seconds(900.0, setButtonText);
}

function disable() {
  Mainloop.source_remove(timeout);
  Main.panel._rightBox.remove_child(panelButton);
}
