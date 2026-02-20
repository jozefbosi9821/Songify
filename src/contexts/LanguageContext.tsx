import React, { createContext, useState, useContext } from 'react';

// Language Types
export type Language = 'en' | 'sq' | 'es' | 'de' | 'fr' | 'it';

// Translations Interface
interface Translations {
  [key: string]: {
    // Sidebar
    home: string;
    search: string;
    library: string;
    settings: string;
    playlists: string;
    playlist: string;
    newPlaylist: string;
    
    // Player
    playing: string;
    paused: string;
    unknownTitle: string;
    unknownArtist: string;
    
    // Settings
    appearance: string;
    theme: string;
    language: string;
    system: string;
    clearCache: string;
    clearCacheDesc: string;
    cleared: string;
    version: string;
    github: string;
    
    // Search / Library
    searchPlaceholder: string;
    noResults: string;
    songs: string;
    artists: string;
    albums: string;
    duration: string;
    actions: string;
    addToQueue: string;
    removeFromLibrary: string;
    
    // Queue
    playQueue: string;
    songsNext: string;
    nowPlaying: string;
    nothingPlaying: string;
    nextUp: string;
    queueEmpty: string;

    // Main Content
    instrumental: string;
    noLyricsFound: string;
    playToSeeLyrics: string;
    clickToRename: string;
    myMusic: string;
    defaultArtist: string;
    songsCount: string;
    hash: string;
    title: string;
    album: string;
    addToPlaylist: string;
    noPlaylistsCreated: string;
    removeFromPlaylist: string;
    moveUp: string;
    moveDown: string;
    showInFolder: string;
    deleteSong: string;
    deleteSongConfirm: string;
    confirmDelete: string;
    libraryEmpty: string;
    addMusicToStart: string;
    playlistEmpty: string;
    addToPlaylistInstruction: string;
    addDescription: string;
    noDescription: string;
    playNext: string;
    goToArtist: string;
    
    // General
    cancel: string;
    confirm: string;
    delete: string;
    edit: string;
    save: string;

    // Player Tooltips
    shuffle: string;
    repeat: string;
    lyrics: string;
    queue: string;
    repeatOff: string;
    repeatAll: string;
    repeatOne: string;

    // Unified Search
    all: string;
    local: string;
    online: string;
    localLibrary: string;
    onlineSearch: string;
    onlineSearchDesc: string;
    comingSoon: string;
    noResultsFor: string;
    tryDifferentKeywords: string;
    createdOn: string;
    browsingLibrary: string;
    idle: string;
    defaultPlaylistName: string;
    noResultsFound: string;
    enterSearchTerm: string;
    
    // Error Boundary
    somethingWentWrong: string;
    reloadApp: string;

    // Menus & Dialogs
    addMusicFiles: string;
    createPlaylist: string;
    deletePlaylist: string;
    downloadsFolder: string;
    openDownloadsFolderDesc: string;
    openFolder: string;
    systemInfo: string;
    userDataPath: string;
    keyboardShortcuts: string;
    aboutSongify: string;
    githubRepo: string;
    license: string;
    madeBy: string;

    // Tray / Controls
    playPause: string;
    nextSong: string;
    previousSong: string;
    volumeUp: string;
    volumeDown: string;
    mute: string;
    closeApp: string;

    // Themes
    themeMidnight: string;
    themeOcean: string;
    themeSunset: string;
    themeForest: string;
    themeNebula: string;
    themeGold: string;

    // Home
    welcomeBack: string;
    goodMorning: string;
    goodAfternoon: string;
    goodEvening: string;
    quickPlay: string;
    yourPlaylists: string;
    noSongsFound: string;
    poweredBy: string;
    searchAndDownload: string;
  };
}

// Dictionary
const translations: Translations = {
  en: {
    home: 'Home',
    search: 'Search',
    library: 'Library',
    settings: 'Settings',
    playlists: 'Playlists',
    playlist: 'Playlist',
    newPlaylist: 'New Playlist',
    playing: 'Playing',
    paused: 'Paused',
    unknownTitle: 'Unknown Title',
    unknownArtist: 'Unknown Artist',
    appearance: 'Appearance',
    theme: 'Theme',
    themeMidnight: 'Midnight (Default)',
    themeOcean: 'Ocean',
    themeSunset: 'Sunset',
    themeForest: 'Forest',
    themeNebula: 'Nebula',
    themeGold: 'Gold Hour',
    language: 'Language',
    system: 'System',
    clearCache: 'Clear Cache',
    clearCacheDesc: 'Remove cached lyrics and metadata',
    cleared: 'Cleared!',
    version: 'Version',
    github: 'GitHub Repository',
    searchPlaceholder: 'Search for songs, artists...',
    noResults: 'No results found',
    songs: 'Songs',
    artists: 'Artists',
    albums: 'Albums',
    duration: 'Duration',
    actions: 'Actions',
    addToQueue: 'Add to Queue',
    removeFromLibrary: 'Remove from Library',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    playQueue: 'Play Queue',
    songsNext: 'songs next',
    nowPlaying: 'Now Playing',
    nothingPlaying: 'Nothing playing',
    nextUp: 'Next Up',
    queueEmpty: 'Your queue is empty',
    instrumental: '♪ Instrumental ♪',
    noLyricsFound: "Looks like we don't have the lyrics for this song.",
    playToSeeLyrics: 'Play a song to see lyrics',
    clickToRename: 'Click to rename',
    myMusic: 'My Music',
    defaultArtist: 'Jozef Gaming',
    songsCount: 'songs',
    hash: '#',
    title: 'Title',
    album: 'Album',
    addToPlaylist: 'Add to Playlist',
    noPlaylistsCreated: 'No playlists created',
    removeFromPlaylist: 'Remove from Playlist',
    moveUp: 'Move Up',
    moveDown: 'Move Down',
    showInFolder: 'Show in Folder',
    deleteSong: 'Delete Song',
    deleteSongConfirm: 'Are you sure you want to delete this song? This action cannot be undone.',
    confirmDelete: 'Are you sure you want to delete',
    libraryEmpty: 'Your library is empty',
    addMusicToStart: 'Search for songs to add them to your library.',
    playlistEmpty: 'Playlist is empty',
    addToPlaylistInstruction: 'Right-click songs in your library to add them here.',
    addDescription: 'Add a description...',
    noDescription: 'No description',
    playNext: 'Play Next',
    goToArtist: 'Go to Artist',
    shuffle: 'Shuffle',
    repeat: 'Repeat',
    repeatOff: 'Repeat Off',
    repeatAll: 'Repeat All',
    repeatOne: 'Repeat One',
    lyrics: 'Lyrics',
    queue: 'Queue',
    all: 'All',
    local: 'Local',
    online: 'Online',
    localLibrary: 'Local Library',
    onlineSearch: 'Online Search',
    onlineSearchDesc: 'We are rebuilding the online music search engine to be faster and more reliable.',
    comingSoon: 'Coming Soon',
    noResultsFor: 'No results found for',
    tryDifferentKeywords: 'Try checking the spelling or use different keywords.',
    createdOn: 'Created on',
    browsingLibrary: 'Browsing Library',
    idle: 'Idle',
    defaultPlaylistName: 'My Playlist',
    somethingWentWrong: 'Something went wrong',
    reloadApp: 'Reload App',
    addMusicFiles: 'Add Music Files',
    createPlaylist: 'Create Playlist',
    deletePlaylist: 'Delete Playlist',
    downloadsFolder: 'Downloads Folder',
    openDownloadsFolderDesc: 'Open the folder where downloaded songs are saved.',
    openFolder: 'Open Folder',
    systemInfo: 'System Info',
    userDataPath: 'User Data Path',
    keyboardShortcuts: 'Keyboard Shortcuts',
    aboutSongify: 'About Songify',
    githubRepo: 'GitHub Repository',
    license: 'License',
    madeBy: 'Created by Jozef Gaming',
    playPause: 'Play / Pause',
    nextSong: 'Next Song',
    previousSong: 'Previous Song',
    volumeUp: 'Volume Up',
    volumeDown: 'Volume Down',
    mute: 'Mute',
    closeApp: 'Close App',
    noResultsFound: 'No results found',
    enterSearchTerm: 'Enter a search term to find songs',
    welcomeBack: 'Welcome back to Songify',
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    quickPlay: 'Quick Play',
    yourPlaylists: 'Your Playlists',
    noSongsFound: 'No songs found. Add music to get started!',
    poweredBy: 'Powered by SoundCloud',
    searchAndDownload: 'Search & Download'
  },
  sq: {
    home: 'Kreu',
    search: 'Kërko',
    library: 'Biblioteka',
    settings: 'Cilësimet',
    playlists: 'Listat',
    playlist: 'Lista',
    newPlaylist: 'Listë e Re',
    playing: 'Duke luajtur',
    paused: 'Pauzë',
    unknownTitle: 'Titull i Panjohur',
    unknownArtist: 'Artist i Panjohur',
    appearance: 'Pamja',
    theme: 'Tema',
    themeMidnight: 'Mesnatë (Parazgjedhur)',
    themeOcean: 'Oqean',
    themeSunset: 'Perëndim Dielli',
    themeForest: 'Pyll',
    themeNebula: 'Nebula',
    themeGold: 'Ora e Artë',
    language: 'Gjuha',
    system: 'Sistemi',
    clearCache: 'Pastro Cache',
    clearCacheDesc: 'Hiq tekstet dhe të dhënat e ruajtura',
    cleared: 'U pastrua!',
    version: 'Versioni',
    github: 'Depo GitHub',
    searchPlaceholder: 'Kërko këngë, artistë...',
    noResults: 'Nuk u gjet asnjë rezultat',
    songs: 'Këngët',
    artists: 'Artistët',
    albums: 'Albumet',
    duration: 'Kohëzgjatja',
    actions: 'Veprime',
    addToQueue: 'Shto në Rradhë',
    removeFromLibrary: 'Hiq nga Biblioteka',
    cancel: 'Anulo',
    confirm: 'Konfirmo',
    delete: 'Fshi',
    edit: 'Ndrysho',
    save: 'Ruaj',
    playQueue: 'Rradha e Luajtjes',
    songsNext: 'këngë në vijim',
    nowPlaying: 'Duke Luajtur Tani',
    nothingPlaying: 'Asgjë duke luajtur',
    nextUp: 'Në Vijim',
    queueEmpty: 'Rradha juaj është bosh',
    instrumental: '♪ Instrumentale ♪',
    noLyricsFound: "Duket se nuk kemi tekstin për këtë këngë.",
    playToSeeLyrics: 'Luaj një këngë për të parë tekstin',
    clickToRename: 'Kliko për të ndryshuar emrin',
    myMusic: 'Muzika Ime',
    defaultArtist: 'Jozef Gaming',
    songsCount: 'këngë',
    hash: '#',
    title: 'Titulli',
    album: 'Albumi',
    addToPlaylist: 'Shto në Listë',
    noPlaylistsCreated: 'Nuk janë krijuar lista',
    removeFromPlaylist: 'Hiq nga Lista',
    moveUp: 'Lëviz Lart',
    moveDown: 'Lëviz Poshtë',
    showInFolder: 'Shfaq në Dosje',
    deleteSong: 'Fshi Këngën',
    deleteSongConfirm: 'A jeni i sigurt që doni të fshini këtë këngë? Ky veprim nuk mund të zhbëhet.',
    confirmDelete: 'A jeni i sigurt që doni të fshini',
    libraryEmpty: 'Biblioteka juaj është bosh',
    addMusicToStart: 'Kërko këngë për t\'i shtuar në bibliotekën tënde.',
    playlistEmpty: 'Lista është bosh',
    addToPlaylistInstruction: 'Kliko me të djathtën mbi këngë në bibliotekë për t\'i shtuar këtu.',
    addDescription: 'Shto një përshkrim...',
    noDescription: 'Pa përshkrim',
    playNext: 'Luaj Tjetrën',
    goToArtist: 'Shko tek Artisti',
    shuffle: 'Përziej',
    repeat: 'Përsërit',
    repeatOff: 'Pa Përsëritje',
    repeatAll: 'Përsërit Të Gjitha',
    repeatOne: 'Përsërit Një',
    lyrics: 'Teksti',
    queue: 'Rradha',
    all: 'Të gjitha',
    local: 'Lokale',
    online: 'Online',
    localLibrary: 'Biblioteka Lokale',
    onlineSearch: 'Kërkimi Online',
    onlineSearchDesc: 'Po rindërtojmë motorin e kërkimit të muzikës online për të qenë më i shpejtë dhe më i besueshëm.',
    comingSoon: 'Së Shpejti',
    noResultsFor: 'Nuk u gjet asnjë rezultat për',
    tryDifferentKeywords: 'Provoni të kontrolloni drejtshkrimin ose përdorni fjalë kyçe të ndryshme.',
    createdOn: 'Krijuar më',
    browsingLibrary: 'Duke shfletuar bibliotekën',
    idle: 'Pasiv',
    defaultPlaylistName: 'Lista Ime',
    somethingWentWrong: 'Diçka shkoi keq',
    reloadApp: 'Ringarko Aplikacionin',
    addMusicFiles: 'Shto Skedarë Muzikorë',
    createPlaylist: 'Krijo Listë',
    deletePlaylist: 'Fshi Listën',
    downloadsFolder: 'Dosja e Shkarkimeve',
    openDownloadsFolderDesc: 'Hapni dosjen ku ruhen këngët e shkarkuara.',
    openFolder: 'Hap Dosjen',
    systemInfo: 'Informacione Sistemi',
    userDataPath: 'Rruga e Të Dhënave të Përdoruesit',
    keyboardShortcuts: 'Shkurtoret e Tastierës',
    aboutSongify: 'Rreth Songify',
    githubRepo: 'Depo GitHub',
    license: 'Licenca',
    madeBy: 'Krijuar nga Jozef Gaming',
    playPause: 'Luaj / Pauzë',
    nextSong: 'Kënga Tjetër',
    previousSong: 'Kënga e Mëparshme',
    volumeUp: 'Ngrit Volumin',
    volumeDown: 'Ul Volumin',
    mute: 'Hesht',
    closeApp: 'Mbyll Aplikacionin',
    noResultsFound: 'Nuk u gjet asnjë rezultat',
    enterSearchTerm: 'Shkruani një term kërkimi për të gjetur këngë',
    welcomeBack: 'Mirë se u ktheve në Songify',
    goodMorning: 'Mirëmëngjes',
    goodAfternoon: 'Mirëdita',
    goodEvening: 'Mirëmbrëma',
    quickPlay: 'Luaj Shpejt',
    yourPlaylists: 'Listat e Tua',
    noSongsFound: 'Nuk u gjet asnjë këngë. Shto muzikë për të filluar!',
    poweredBy: 'Mundësuar nga SoundCloud',
    searchAndDownload: 'Kërko & Shkarko'
  },
  es: {
    home: 'Inicio',
    search: 'Buscar',
    library: 'Biblioteca',
    settings: 'Ajustes',
    playlists: 'Listas',
    playlist: 'Lista',
    newPlaylist: 'Nueva Lista',
    playing: 'Reproduciendo',
    paused: 'Pausado',
    unknownTitle: 'Título Desconocido',
    unknownArtist: 'Artista Desconocido',
    appearance: 'Apariencia',
    theme: 'Tema',
    themeMidnight: 'Medianoche (Predeterminado)',
    themeOcean: 'Océano',
    themeSunset: 'Atardecer',
    themeForest: 'Bosque',
    themeNebula: 'Nebulosa',
    themeGold: 'Hora Dorada',
    language: 'Idioma',
    system: 'Sistema',
    clearCache: 'Borrar Caché',
    clearCacheDesc: 'Eliminar letras y metadatos guardados',
    cleared: '¡Borrado!',
    version: 'Versión',
    github: 'Repositorio GitHub',
    searchPlaceholder: 'Buscar canciones, artistas...',
    noResults: 'No se encontraron resultados',
    songs: 'Canciones',
    artists: 'Artistas',
    albums: 'Álbumes',
    duration: 'Duración',
    actions: 'Acciones',
    addToQueue: 'Añadir a la Cola',
    removeFromLibrary: 'Eliminar de la Biblioteca',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    delete: 'Eliminar',
    edit: 'Editar',
    save: 'Guardar',
    playQueue: 'Cola de Reproducción',
    songsNext: 'canciones siguientes',
    nowPlaying: 'Reproduciendo Ahora',
    nothingPlaying: 'Nada reproduciendo',
    nextUp: 'Siguiente',
    queueEmpty: 'Tu cola está vacía',
    instrumental: '♪ Instrumental ♪',
    noLyricsFound: "Parece que no tenemos la letra de esta canción.",
    playToSeeLyrics: 'Reproduce una canción para ver la letra',
    clickToRename: 'Clic para renombrar',
    myMusic: 'Mi Música',
    defaultArtist: 'Jozef Gaming',
    songsCount: 'canciones',
    hash: '#',
    title: 'Título',
    album: 'Álbum',
    addToPlaylist: 'Añadir a Lista',
    noPlaylistsCreated: 'No hay listas creadas',
    removeFromPlaylist: 'Eliminar de Lista',
    moveUp: 'Mover Arriba',
    moveDown: 'Mover Abajo',
    showInFolder: 'Mostrar en Carpeta',
    deleteSong: 'Eliminar Canción',
    deleteSongConfirm: '¿Estás seguro de que quieres eliminar esta canción? Esta acción no se puede deshacer.',
    confirmDelete: '¿Estás seguro de que quieres eliminar',
    libraryEmpty: 'Tu biblioteca está vacía',
    addMusicToStart: 'Busca canciones para añadirlas a tu biblioteca.',
    playlistEmpty: 'La lista está vacía',
    addToPlaylistInstruction: 'Haz clic derecho en las canciones de tu biblioteca para añadirlas aquí.',
    addDescription: 'Añadir una descripción...',
    noDescription: 'Sin descripción',
    playNext: 'Reproducir Siguiente',
    goToArtist: 'Ir al Artista',
    shuffle: 'Aleatorio',
    repeat: 'Repetir',
    repeatOff: 'No repetir',
    repeatAll: 'Repetir todo',
    repeatOne: 'Repetir una',
    lyrics: 'Letra',
    queue: 'Cola',
    all: 'Todo',
    local: 'Local',
    online: 'En línea',
    localLibrary: 'Biblioteca Local',
    onlineSearch: 'Búsqueda en Línea',
    onlineSearchDesc: 'Estamos reconstruyendo el motor de búsqueda de música en línea para que sea más rápido y confiable.',
    comingSoon: 'Próximamente',
    noResultsFor: 'No se encontraron resultados para',
    tryDifferentKeywords: 'Intenta verificar la ortografía o usa palabras clave diferentes.',
    somethingWentWrong: 'Algo salió mal',
    reloadApp: 'Recargar Aplicación',
    addMusicFiles: 'Añadir Archivos de Música',
    createPlaylist: 'Crear Lista',
    deletePlaylist: 'Eliminar Lista',
    downloadsFolder: 'Carpeta de Descargas',
    openDownloadsFolderDesc: 'Abre la carpeta donde se guardan las canciones descargadas.',
    openFolder: 'Abrir Carpeta',
    systemInfo: 'Información del Sistema',
    userDataPath: 'Ruta de Datos de Usuario',
    keyboardShortcuts: 'Atajos de Teclado',
    aboutSongify: 'Sobre Songify',
    githubRepo: 'Repositorio GitHub',
    license: 'Licencia',
    madeBy: 'Creado por Jozef Gaming',
    playPause: 'Reproducir / Pausa',
    nextSong: 'Siguiente Canción',
    previousSong: 'Canción Anterior',
    volumeUp: 'Subir Volumen',
    volumeDown: 'Bajar Volumen',
    mute: 'Silenciar',
    closeApp: 'Cerrar Aplicación',
    createdOn: 'Creado el',
    browsingLibrary: 'Navegando por la biblioteca',
    idle: 'Inactivo',
    defaultPlaylistName: 'Mi Lista de Reproducción',
    noResultsFound: 'No se encontraron resultados',
    enterSearchTerm: 'Introduce un término de búsqueda para encontrar canciones',
    welcomeBack: 'Bienvenido de nuevo a Songify',
    goodMorning: 'Buenos Días',
    goodAfternoon: 'Buenas Tardes',
    goodEvening: 'Buenas Noches',
    quickPlay: 'Reproducción Rápida',
    yourPlaylists: 'Tus Listas',
    noSongsFound: 'No se encontraron canciones. ¡Añade música para empezar!',
    poweredBy: 'Desarrollado por SoundCloud',
    searchAndDownload: 'Buscar y Descargar'
  },
  de: {
    home: 'Startseite',
    search: 'Suche',
    library: 'Bibliothek',
    settings: 'Einstellungen',
    playlists: 'Wiedergabelisten',
    playlist: 'Wiedergabeliste',
    newPlaylist: 'Neue Wiedergabeliste',
    playing: 'Wiedergabe',
    paused: 'Pausiert',
    unknownTitle: 'Unbekannter Titel',
    unknownArtist: 'Unbekannter Künstler',
    appearance: 'Aussehen',
    theme: 'Thema',
    themeMidnight: 'Mitternacht (Standard)',
    themeOcean: 'Ozean',
    themeSunset: 'Sonnenuntergang',
    themeForest: 'Wald',
    themeNebula: 'Nebel',
    themeGold: 'Goldene Stunde',
    language: 'Sprache',
    system: 'System',
    clearCache: 'Cache leeren',
    clearCacheDesc: 'Gespeicherte Texte und Metadaten entfernen',
    cleared: 'Geleert!',
    version: 'Version',
    github: 'GitHub Repository',
    searchPlaceholder: 'Suche nach Songs, Künstlern...',
    noResults: 'Keine Ergebnisse gefunden',
    songs: 'Songs',
    artists: 'Künstler',
    albums: 'Alben',
    duration: 'Dauer',
    actions: 'Aktionen',
    addToQueue: 'Zur Warteschlange hinzufügen',
    removeFromLibrary: 'Aus Bibliothek entfernen',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    save: 'Speichern',
    playQueue: 'Warteschlange',
    songsNext: 'nächste Lieder',
    nowPlaying: 'Jetzt läuft',
    nothingPlaying: 'Nichts läuft',
    nextUp: 'Nächstes',
    queueEmpty: 'Deine Warteschlange ist leer',
    instrumental: '♪ Instrumental ♪',
    noLyricsFound: "Scheint, als hätten wir keinen Text für diesen Song.",
    playToSeeLyrics: 'Spiele einen Song ab, um den Text zu sehen',
    clickToRename: 'Klicken zum Umbenennen',
    myMusic: 'Meine Musik',
    defaultArtist: 'Jozef Gaming',
    songsCount: 'Lieder',
    hash: '#',
    title: 'Titel',
    album: 'Album',
    addToPlaylist: 'Zur Playlist hinzufügen',
    noPlaylistsCreated: 'Keine Playlists erstellt',
    removeFromPlaylist: 'Aus Playlist entfernen',
    moveUp: 'Nach oben verschieben',
    moveDown: 'Nach unten verschieben',
    showInFolder: 'Im Ordner anzeigen',
    deleteSong: 'Song löschen',
    deleteSongConfirm: 'Bist du sicher, dass du diesen Song löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.',
    confirmDelete: 'Bist du sicher, dass du löschen möchtest',
    libraryEmpty: 'Deine Bibliothek ist leer',
    addMusicToStart: 'Suche nach Songs, um sie deiner Bibliothek hinzuzufügen.',
    playlistEmpty: 'Playlist ist leer',
    addToPlaylistInstruction: 'Rechtsklick auf Songs in deiner Bibliothek, um sie hier hinzuzufügen.',
    addDescription: 'Beschreibung hinzufügen...',
    noDescription: 'Keine Beschreibung',
    playNext: 'Als nächstes spielen',
    goToArtist: 'Zum Künstler gehen',
    shuffle: 'Zufallswiedergabe',
    repeat: 'Wiederholen',
    lyrics: 'Songtexte',
    queue: 'Warteschlange',
    repeatOff: 'Aus',
    repeatAll: 'Alle',
    repeatOne: 'Eins',
    all: 'Alle',
    local: 'Lokal',
    online: 'Online',
    localLibrary: 'Lokale Bibliothek',
    onlineSearch: 'Online-Suche',
    onlineSearchDesc: 'Wir bauen die Online-Musiksuchmaschine neu auf, um schneller und zuverlässiger zu sein.',
    comingSoon: 'Demnächst',
    noResultsFor: 'Keine Ergebnisse gefunden für',
    tryDifferentKeywords: 'Versuchen Sie, die Rechtschreibung zu überprüfen oder andere Schlüsselwörter zu verwenden.',
    createdOn: 'Erstellt am',
    browsingLibrary: 'Bibliothek durchsuchen',
    idle: 'Leerlauf',
    defaultPlaylistName: 'Meine Playlist',
    somethingWentWrong: 'Etwas ist schiefgelaufen',
    reloadApp: 'App neu laden',
    addMusicFiles: 'Musikdateien hinzufügen',
    createPlaylist: 'Playlist erstellen',
    deletePlaylist: 'Playlist löschen',
    downloadsFolder: 'Downloads-Ordner',
    openDownloadsFolderDesc: 'Öffnen Sie den Ordner, in dem heruntergeladene Lieder gespeichert werden.',
    openFolder: 'Ordner öffnen',
    systemInfo: 'Systeminformationen',
    userDataPath: 'Benutzerdatenpfad',
    keyboardShortcuts: 'Tastaturkürzel',
    aboutSongify: 'Über Songify',
    githubRepo: 'GitHub-Repository',
    license: 'Lizenz',
    madeBy: 'Erstellt von Jozef Gaming',
    playPause: 'Wiedergabe / Pause',
    nextSong: 'Nächstes Lied',
    previousSong: 'Vorheriges Lied',
    volumeUp: 'Lautstärke erhöhen',
    volumeDown: 'Lautstärke verringern',
    mute: 'Stummschalten',
    closeApp: 'App schließen',
    noResultsFound: 'Keine Ergebnisse gefunden',
    enterSearchTerm: 'Geben Sie einen Suchbegriff ein, um Songs zu finden',
    welcomeBack: 'Willkommen zurück bei Songify',
    goodMorning: 'Guten Morgen',
    goodAfternoon: 'Guten Tag',
    goodEvening: 'Guten Abend',
    quickPlay: 'Schnellstart',
    yourPlaylists: 'Deine Playlists',
    noSongsFound: 'Keine Songs gefunden. Füge Musik hinzu, um zu beginnen!',
    poweredBy: 'Bereitgestellt von SoundCloud',
    searchAndDownload: 'Suchen & Herunterladen'
  },
  fr: {
    home: 'Accueil',
    search: 'Recherche',
    library: 'Bibliothèque',
    settings: 'Paramètres',
    playlists: 'Playlists',
    playlist: 'Playlist',
    newPlaylist: 'Nouvelle Playlist',
    playing: 'Lecture',
    paused: 'Pause',
    unknownTitle: 'Titre Inconnu',
    unknownArtist: 'Artiste Inconnu',
    appearance: 'Apparence',
    theme: 'Thème',
    themeMidnight: 'Minuit (Par défaut)',
    themeOcean: 'Océan',
    themeSunset: 'Coucher de soleil',
    themeForest: 'Forêt',
    themeNebula: 'Nébuleuse',
    themeGold: 'Heure Dorée',
    language: 'Langue',
    system: 'Système',
    clearCache: 'Vider le Cache',
    clearCacheDesc: 'Supprimer les paroles et métadonnées',
    cleared: 'Vidé !',
    version: 'Version',
    github: 'Dépôt GitHub',
    searchPlaceholder: 'Rechercher des chansons, artistes...',
    noResults: 'Aucun résultat trouvé',
    songs: 'Chansons',
    artists: 'Artistes',
    albums: 'Albums',
    duration: 'Durée',
    actions: 'Actions',
    addToQueue: 'Ajouter à la file',
    removeFromLibrary: 'Retirer de la bibliothèque',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    delete: 'Supprimer',
    edit: 'Modifier',
    save: 'Enregistrer',
    playQueue: 'File de Lecture',
    songsNext: 'chansons suivantes',
    nowPlaying: 'En Lecture',
    nothingPlaying: 'Rien en lecture',
    nextUp: 'À Suivre',
    queueEmpty: 'Votre file est vide',
    instrumental: '♪ Instrumental ♪',
    noLyricsFound: "Il semble que nous n'ayons pas les paroles de cette chanson.",
    playToSeeLyrics: 'Jouez une chanson pour voir les paroles',
    clickToRename: 'Cliquer pour renommer',
    myMusic: 'Ma Musique',
    defaultArtist: 'Jozef Gaming',
    songsCount: 'chansons',
    hash: '#',
    title: 'Titre',
    album: 'Album',
    addToPlaylist: 'Ajouter à la Playlist',
    noPlaylistsCreated: 'Aucune playlist créée',
    removeFromPlaylist: 'Retirer de la Playlist',
    moveUp: 'Monter',
    moveDown: 'Descendre',
    showInFolder: 'Afficher dans le dossier',
    deleteSong: 'Supprimer la chanson',
    deleteSongConfirm: 'Êtes-vous sûr de vouloir supprimer cette chanson ? Cette action est irréversible.',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer',
    libraryEmpty: 'Votre bibliothèque est vide',
    addMusicToStart: 'Recherchez des chansons pour les ajouter à votre bibliothèque.',
    playlistEmpty: 'La playlist est vide',
    addToPlaylistInstruction: 'Faites un clic droit sur les chansons de votre bibliothèque pour les ajouter ici.',
    addDescription: 'Ajouter une description...',
    noDescription: 'Aucune description',
    playNext: 'Jouer ensuite',
    goToArtist: 'Aller à l\'artiste',
    shuffle: 'Aléatoire',
    queue: 'File d\'attente',
    all: 'Tout',
    local: 'Local',
    online: 'En ligne',
    localLibrary: 'Bibliothèque locale',
    onlineSearch: 'Recherche en ligne',
    onlineSearchDesc: 'Nous reconstruisons le moteur de recherche de musique en ligne pour qu\'il soit plus rapide et plus fiable.',
    comingSoon: 'Bientôt disponible',
    repeat: 'Répéter',
    repeatOff: 'Pas de répétition',
    repeatAll: 'Tout répéter',
    repeatOne: 'Répéter une',
    lyrics: 'Paroles',
    noResultsFor: 'Aucun résultat trouvé pour',
    tryDifferentKeywords: 'Essayez de vérifier l\'orthographe ou d\'utiliser des mots-clés différents.',
    somethingWentWrong: 'Quelque chose s\'est mal passé',
    reloadApp: 'Recharger l\'application',
    addMusicFiles: 'Ajouter des fichiers musicaux',
    createPlaylist: 'Créer une playlist',
    deletePlaylist: 'Supprimer la playlist',
    downloadsFolder: 'Dossier de téléchargements',
    openDownloadsFolderDesc: 'Ouvrez le dossier où les chansons téléchargées sont enregistrées.',
    openFolder: 'Ouvrir le dossier',
    systemInfo: 'Informations système',
    userDataPath: 'Chemin des données utilisateur',
    keyboardShortcuts: 'Raccourcis clavier',
    aboutSongify: 'À propos de Songify',
    githubRepo: 'Dépôt GitHub',
    license: 'Licence',
    madeBy: 'Créé par Jozef Gaming',
    playPause: 'Lecture / Pause',
    nextSong: 'Chanson suivante',
    previousSong: 'Chanson précédente',
    volumeUp: 'Monter le volume',
    volumeDown: 'Baisser le volume',
    mute: 'Muet',
    closeApp: 'Fermer l\'application',
    createdOn: 'Créé le',
    browsingLibrary: 'Parcourir la bibliothèque',
    idle: 'Inactif',
    defaultPlaylistName: 'Ma Playlist',
    noResultsFound: 'Aucun résultat trouvé',
    enterSearchTerm: 'Entrez un terme de recherche pour trouver des chansons',
    welcomeBack: 'Bienvenue sur Songify',
    goodMorning: 'Bonjour',
    goodAfternoon: 'Bon Après-midi',
    goodEvening: 'Bonsoir',
    quickPlay: 'Lecture Rapide',
    yourPlaylists: 'Vos Playlists',
    noSongsFound: 'Aucune chanson trouvée. Ajoutez de la musique pour commencer !',
    poweredBy: 'Propulsé par SoundCloud',
    searchAndDownload: 'Rechercher et Télécharger'
  },
  it: {
    home: 'Home',
    search: 'Cerca',
    library: 'Libreria',
    settings: 'Impostazioni',
    playlists: 'Playlist',
    playlist: 'Playlist',
    newPlaylist: 'Nuova Playlist',
    playing: 'In riproduzione',
    paused: 'In pausa',
    unknownTitle: 'Titolo Sconosciuto',
    unknownArtist: 'Artista Sconosciuto',
    appearance: 'Aspetto',
    theme: 'Tema',
    themeMidnight: 'Mezzanotte (Predefinito)',
    themeOcean: 'Oceano',
    themeSunset: 'Tramonto',
    themeForest: 'Foresta',
    themeNebula: 'Nebulosa',
    themeGold: 'Ora d\'Oro',
    language: 'Lingua',
    system: 'Sistema',
    clearCache: 'Svuota Cache',
    clearCacheDesc: 'Rimuovi testi e metadati salvati',
    cleared: 'Svuotata!',
    version: 'Versione',
    github: 'Repository GitHub',
    searchPlaceholder: 'Cerca brani, artisti...',
    noResults: 'Nessun risultato trovato',
    songs: 'Brani',
    artists: 'Artisti',
    albums: 'Album',
    duration: 'Durata',
    actions: 'Azioni',
    addToQueue: 'Aggiungi alla Coda',
    removeFromLibrary: 'Rimuovi dalla Libreria',
    cancel: 'Annulla',
    confirm: 'Conferma',
    delete: 'Elimina',
    edit: 'Modifica',
    save: 'Salva',
    playQueue: 'Coda di Riproduzione',
    songsNext: 'brani successivi',
    nowPlaying: 'In Riproduzione',
    nothingPlaying: 'Nessuna riproduzione',
    nextUp: 'Successivo',
    queueEmpty: 'La tua coda è vuota',
    instrumental: '♪ Strumentale ♪',
    noLyricsFound: "Sembra che non abbiamo il testo di questa canzone.",
    playToSeeLyrics: 'Riproduci una canzone per vedere il testo',
    clickToRename: 'Clicca per rinominare',
    myMusic: 'La Mia Musica',
    defaultArtist: 'Jozef Gaming',
    songsCount: 'brani',
    hash: '#',
    title: 'Titolo',
    album: 'Album',
    addToPlaylist: 'Aggiungi alla Playlist',
    noPlaylistsCreated: 'Nessuna playlist creata',
    removeFromPlaylist: 'Rimuovi dalla Playlist',
    moveUp: 'Sposta Su',
    moveDown: 'Sposta Giù',
    showInFolder: 'Mostra nella Cartella',
    deleteSong: 'Elimina Canzone',
    deleteSongConfirm: 'Sei sicuro di voler eliminare questa canzone? Questa azione non può essere annullata.',
    confirmDelete: 'Sei sicuro di voler eliminare',
    libraryEmpty: 'La tua libreria è vuota',
    addMusicToStart: 'Cerca canzoni per aggiungerle alla tua libreria.',
    playlistEmpty: 'La playlist è vuota',
    addToPlaylistInstruction: 'Fai clic destro sui brani nella tua libreria per aggiungerli qui.',
    addDescription: 'Aggiungi una descrizione...',
    noDescription: 'Nessuna descrizione',
    playNext: 'Riproduci successivo',
    goToArtist: 'Vai all\'artista',
    shuffle: 'Casuale',
    repeat: 'Ripeti',
    lyrics: 'Testo',
    queue: 'Coda',
    repeatOff: 'Disattivato',
    repeatAll: 'Tutto',
    repeatOne: 'Uno',
    all: 'Tutto',
    local: 'Locale',
    online: 'Online',
    localLibrary: 'Libreria Locale',
    onlineSearch: 'Ricerca Online',
    onlineSearchDesc: 'Stiamo ricostruendo il motore di ricerca musicale online per essere più veloce e affidabile.',
    comingSoon: 'Prossimamente',
    noResultsFor: 'Nessun risultato trovato per',
    tryDifferentKeywords: 'Prova a controllare l\'ortografia o usa parole chiave diverse.',
    createdOn: 'Creato il',
    browsingLibrary: 'Navigando la libreria',
    idle: 'Inattivo',
    defaultPlaylistName: 'La mia Playlist',
    somethingWentWrong: 'Qualcosa è andato storto',
    reloadApp: 'Ricarica App',
    addMusicFiles: 'Aggiungi file musicali',
    createPlaylist: 'Crea playlist',
    deletePlaylist: 'Elimina playlist',
    downloadsFolder: 'Cartella download',
    openDownloadsFolderDesc: 'Apri la cartella in cui vengono salvati i brani scaricati.',
    openFolder: 'Apri cartella',
    systemInfo: 'Informazioni di sistema',
    userDataPath: 'Percorso dati utente',
    keyboardShortcuts: 'Scorciatoie da tastiera',
    aboutSongify: 'Informazioni su Songify',
    githubRepo: 'Repository GitHub',
    license: 'Licenza',
    madeBy: 'Creato da Jozef Gaming',
    playPause: 'Riproduci / Pausa',
    nextSong: 'Brano successivo',
    previousSong: 'Brano precedente',
    volumeUp: 'Alza volume',
    volumeDown: 'Abbassa volume',
    mute: 'Muto',
    closeApp: 'Chiudi App',
    noResultsFound: 'Nessun risultato trovato',
    enterSearchTerm: 'Inserisci un termine di ricerca per trovare canzoni',
    welcomeBack: 'Bentornato su Songify',
    goodMorning: 'Buongiorno',
    goodAfternoon: 'Buon Pomeriggio',
    goodEvening: 'Buonasera',
    quickPlay: 'Riproduzione Rapida',
    yourPlaylists: 'Le Tue Playlist',
    noSongsFound: 'Nessuna canzone trovata. Aggiungi musica per iniziare!',
    poweredBy: 'Powered by SoundCloud',
    searchAndDownload: 'Cerca e Scarica'
  }
};

// Context
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations['en'];
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Load from localStorage or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('songify-language');
      // Validate that the saved language actually exists in translations
      if (saved && Object.prototype.hasOwnProperty.call(translations, saved)) {
        return saved as Language;
      }
    } catch (e) {
      console.warn('Failed to access localStorage for language:', e);
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('songify-language', lang);
    } catch (e) {
      console.warn('Failed to save language to localStorage:', e);
    }
  };

  // Fallback to English if translation is missing
  const t = translations[language] || translations['en'];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
