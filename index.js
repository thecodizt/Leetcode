const { app, BrowserWindow } = require( 'electron' );
const path = require( 'path' );
const fs = require( 'fs' );

function createWindow () {
    // Create the browser window.
    const win = new BrowserWindow( {
        // fullscreen: true,
        height: 10000,
        width: 10000,
        icon: path.join( __dirname, 'icon.png' ),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true
        }
    } );

    // win.maximize()

    // and load the index.html of the app.
    win.loadFile( 'index.html' );

    // Load session cookies from file
    if ( fs.existsSync( 'session.json' ) ) {
        const cookies = JSON.parse( fs.readFileSync( 'session.json', 'utf-8' ) );
        const session = win.webContents.session;
        cookies.forEach( cookie => {
            let url = `${ cookie.secure ? 'https' : 'http' }://${ cookie.domain }${ cookie.path }`;
            session.cookies.set( { url, ...cookie }, error => {
                if ( error ) console.error( error );
            } );
        } );
    }

    // Save session cookies to file every 10 minutes
    setInterval( () => saveSession( win ), 10 * 60 * 1000 );

    // Save session cookies to file when app is closed
    win.on( 'close', () => saveSession( win ) );
}

function saveSession ( win ) {
    const cookies = win.webContents.session.cookies;
    cookies.get( {}, ( error, cookies ) => {
        if ( error ) throw error;
        fs.writeFileSync( 'session.json', JSON.stringify( cookies ) );
    } );
}

app.whenReady().then( createWindow );
