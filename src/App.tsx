import { useState, useRef, useEffect, useMemo } from 'react';
import Hls from 'hls.js';
import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { MainContent } from './components/MainContent';
import { Settings } from './components/Settings';
import { Queue } from './components/Queue';
import { UnifiedSearch } from './components/UnifiedSearch';
import { Home } from './components/Home';
import { ArtistPage } from './components/ArtistPage';
import { LyricsView } from './components/LyricsView';
import type { Song, Playlist } from './types';
import { useLanguage, LanguageProvider } from './contexts/LanguageContext';
import { platform } from './services/platform';
import { soundcloud } from './services/soundcloud';

import { ConfirmationModal } from './components/ConfirmationModal';

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

function AppContent() {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'settings' | 'playlist' | 'library' | 'artist'>('home');
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('songify_volume');
    return saved ? parseFloat(saved) : 0.5;
  });
  const [showLyrics, setShowLyrics] = useState(false);
  const [isShuffled, setIsShuffled] = useState(() => {
    return localStorage.getItem('songify_shuffle') === 'true';
  });
  const [shuffleOrder, setShuffleOrder] = useState<number[] | null>(null);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>(() => {
    const saved = localStorage.getItem('songify_repeat');
    return (saved as 'off' | 'all' | 'one') || 'off';
  });

  useEffect(() => {
    localStorage.setItem('songify_shuffle', isShuffled.toString());
  }, [isShuffled]);

  useEffect(() => {
    localStorage.setItem('songify_repeat', repeatMode);
  }, [repeatMode]);
  const [showQueue, setShowQueue] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('songify_theme');
    return saved || 'theme-midnight';
  });

  useEffect(() => {
    localStorage.setItem('songify_theme', theme);
  }, [theme]);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const currentSongPathRef = useRef<string | null>(null);
  const processedSongsRef = useRef<Set<string>>(new Set());
  const prevQueueRef = useRef<string[]>([]);

  // Cleanup HLS on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  // Load Library on Mount
  useEffect(() => {
      platform.loadLibrary()
        .then(data => {
          if (data) {
            let loadedSongs = [];
            if (Array.isArray(data)) {
               // Migration for old format (just songs array)
               setSongs(data);
               loadedSongs = data;
            } else {
               setSongs(data.songs || []);
               setPlaylists(data.playlists || []);
               loadedSongs = data.songs || [];
            }
            // Initialize Queue with all songs
            setQueue(loadedSongs.map(s => s.path));
          }
        })
        .catch(err => console.error("Error loading library:", err));
  }, []);

  // Save Library on Change
  useEffect(() => {
    if (songs.length > 0 || playlists.length > 0) {
      const timeout = setTimeout(() => {
        platform.saveLibrary({ songs, playlists });
      }, 1000); // Debounce save
      return () => clearTimeout(timeout);
    }
  }, [songs, playlists]);

  // Background Metadata Enrichment
  useEffect(() => {
    songs.forEach((song) => {
      const fileName = song.path.split(/[/\\]/).pop() || '';
      // If song needs metadata and hasn't been processed
      if (
        (song.artist === 'Unknown Artist' || song.title === fileName) && 
        !processedSongsRef.current.has(song.path)
      ) {
        processedSongsRef.current.add(song.path);
        
        const query = song.artist === 'Unknown Artist' 
          ? song.title 
          : `${song.artist} ${song.title}`;
          
        platform.searchMetadata(query)
          .then(metadata => {
            if (metadata) {
              setSongs(prevSongs => prevSongs.map(s => 
                s.path === song.path ? { 
                  ...s, 
                  artist: s.artist === 'Unknown Artist' ? metadata.artist : s.artist,
                  title: s.title === 'Unknown Title' || s.title === fileName ? metadata.title : s.title,
                  album: s.album === 'Unknown Album' ? metadata.album : s.album,
                  artwork: s.artwork || metadata.artwork 
                } : s
              ));
            }
          })
          .catch(err => console.error(`Error enriching metadata for ${song.title}:`, err));
      }
    });
  }, [songs]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else if (repeatMode === 'all') {
        playNext();
      } else {
        // Repeat Off
        // Check if it's the last song
        const isLastSong = isShuffled && shuffleOrder 
          ? shuffleOrder.indexOf(currentSongIndex) === shuffleOrder.length - 1
          : currentSongIndex === queue.length - 1;
        
        if (isLastSong) {
          setIsPlaying(false);
          // Optional: Reset to start?
        } else {
          playNext();
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSongIndex, queue, isShuffled, shuffleOrder, repeatMode]); // Added dependencies for handleEnded closure

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    localStorage.setItem('songify_volume', volume.toString());
  }, [volume]);

  const currentSong = useMemo(() => {
    if (currentSongIndex === -1 || !queue[currentSongIndex]) return null;
    return songs.find(s => s.path === queue[currentSongIndex]) || null;
  }, [currentSongIndex, queue, songs]);

  // Discord RPC Update
  useEffect(() => {
    if (currentSong) {
      const activity: any = {
        type: 2, // LISTENING
        details: currentSong.title || t.unknownTitle,
        state: `by ${currentSong.artist || t.unknownArtist}`, // More descriptive
        largeImageKey: 'songify_logo',
        largeImageText: 'Songify',
        instance: false,
      };

      if (isPlaying) {
        const remaining = (currentSong.duration || 0) - progress;
        if (remaining > 0) {
            activity.endTimestamp = Math.floor(Date.now() + remaining * 1000);
        }
        activity.smallImageKey = 'play';
        activity.smallImageText = t.playing;
      } else {
        activity.smallImageKey = 'pause';
        activity.smallImageText = t.paused;
      }
      
      platform.setActivity(activity).catch(console.error);
    } else {
      platform.setActivity({
        type: 2, // LISTENING
        details: t.browsingLibrary,
        state: t.idle,
        largeImageKey: 'songify_logo',
        largeImageText: 'Songify',
        instance: false,
      }).catch(console.error);
    }
  }, [currentSong, isPlaying, t]); // Added t dependency

  useEffect(() => {
    if (currentSong) {
      // If we don't have lyrics and have enough info to search
      if (!currentSong.lyrics && currentSong.artist && currentSong.title && currentSong.artist !== 'Unknown Artist') {
          // Attempt to fetch lyrics
          platform.searchLyrics(currentSong.artist, currentSong.title)
            .then(lyrics => {
              if (lyrics) {
                setSongs(prevSongs => prevSongs.map(s => 
                  s.path === currentSong.path ? { ...s, lyrics } : s
                ));
              }
            })
            .catch(err => console.error("Error searching lyrics:", err));
      }

      const query = currentSong.artist === 'Unknown Artist' 
        ? currentSong.title 
        : `${currentSong.artist} ${currentSong.title}`;
        
      if (!currentSong.artwork && currentSong.title) {
          platform.searchMetadata(query)
            .then(metadata => {
              if (metadata) {
                 setSongs(prevSongs => prevSongs.map(s => 
                   s.path === currentSong.path ? { 
                     ...s, 
                     artist: s.artist === 'Unknown Artist' ? metadata.artist : s.artist,
                     title: s.title === 'Unknown Title' ? metadata.title : s.title,
                     album: s.album === 'Unknown Album' ? metadata.album : s.album,
                     artwork: metadata.artwork 
                   } : s
                 ));
              }
            })
            .catch(err => console.error("Error searching metadata:", err));
      }
    }
    
    if (currentSong && audioRef.current) {
      // Use the custom protocol to bypass security restrictions
      // Ensure we don't reload if it's the same song
      if (currentSongPathRef.current === currentSong.path) {
        if (isPlaying && audioRef.current.paused) {
           audioRef.current.play().catch(console.error);
        }
        return;
      }
      
      currentSongPathRef.current = currentSong.path;
      
      const playAudio = (url: string) => {
          if (!audioRef.current) return;
          
          // Check if HLS (SoundCloud streams or .m3u8)
          const isHls = url.includes('.m3u8') || 
                        (url.includes('playlist') && (url.includes('sndcdn.com') || url.includes('soundcloud.com')));

          if (Hls.isSupported() && isHls) {
              if (hlsRef.current) {
                  hlsRef.current.destroy();
              }
              
              const hls = new Hls({
                  enableWorker: true,
                  lowLatencyMode: true,
              });
              hlsRef.current = hls;
              
              hls.loadSource(url);
              hls.attachMedia(audioRef.current);
              
              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                  if (isPlaying) {
                      audioRef.current?.play().catch(err => {
                           if (err.name !== 'AbortError') console.error("Error playing HLS song:", err);
                      });
                  }
              });
              
              hls.on(Hls.Events.ERROR, (_event, data) => {
                  if (data.fatal) {
                      switch (data.type) {
                          case Hls.ErrorTypes.NETWORK_ERROR:
                              console.error("HLS Network Error, recovering...");
                              hls.startLoad();
                              break;
                          case Hls.ErrorTypes.MEDIA_ERROR:
                              console.error("HLS Media Error, recovering...");
                              hls.recoverMediaError();
                              break;
                          default:
                              console.error("HLS Fatal Error, destroying...");
                              hls.destroy();
                              break;
                      }
                  }
              });
          } else {
              // Standard playback
              if (hlsRef.current) {
                  hlsRef.current.destroy();
                  hlsRef.current = null;
              }

              audioRef.current.src = url;
              if (isPlaying) {
                audioRef.current.play().catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error("Error playing song:", err);
                    }
                });
              }
          }
      };

      if (currentSong.isOnline) {
           // Online track
           if (currentSong.streamUrl) {
               if (currentSong.soundcloudId) {
                   const resolvingPath = currentSong.path;
                   console.log("[App] Resolving SoundCloud stream:", currentSong.streamUrl);
                   
                   // Fallback permalink generation if missing
                   let permalink = currentSong.permalink;
                   if (!permalink && currentSong.artist && currentSong.title) {
                       const artistSlug = currentSong.artist.toLowerCase().replace(/\s+/g, '-');
                       const titleSlug = currentSong.title.toLowerCase().replace(/\s+/g, '-');
                       permalink = `https://soundcloud.com/${artistSlug}/${titleSlug}`;
                       console.log("[App] Generated fallback permalink:", permalink);
                   }

                   soundcloud.resolveStreamUrl(currentSong.streamUrl, permalink).then(url => {
                       // Prevent race condition: only play if this is still the current song
                       if (currentSongPathRef.current !== resolvingPath) {
                           console.log("[App] Ignoring resolved stream for previous song");
                           return;
                       }

                       if (url) {
                           console.log("[App] Playing resolved URL:", url);
                           playAudio(url);
                       } else {
                           console.error("Could not resolve stream URL for", currentSong.title);
                       }
                   }).catch(err => {
                       console.error("[App] Error resolving stream:", err);
                   });
               } else {
                   // Direct stream URL (e.g. MP3.pm)
                   playAudio(currentSong.streamUrl);
               }
           } else {
               console.error("No stream URL available for online song:", currentSong.title);
           }
      } else {
          // Local file
          const songUrl = `songify://stream?path=${encodeURIComponent(currentSong.path)}`;
          playAudio(songUrl);
      }
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
            if (e.name !== 'AbortError') {
                console.error("Play error:", e);
            }
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (queue.length === 0) return;
    
    if (isShuffled && shuffleOrder) {
      const currentShufflePos = shuffleOrder.indexOf(currentSongIndex);
      const nextShufflePos = (currentShufflePos + 1) % shuffleOrder.length;
      setCurrentSongIndex(shuffleOrder[nextShufflePos]);
    } else {
      setCurrentSongIndex((prev) => (prev + 1) % queue.length);
    }
  };

  const playPrev = () => {
    if (queue.length === 0) return;

    if (isShuffled && shuffleOrder) {
      const currentShufflePos = shuffleOrder.indexOf(currentSongIndex);
      const prevShufflePos = (currentShufflePos - 1 + shuffleOrder.length) % shuffleOrder.length;
      setCurrentSongIndex(shuffleOrder[prevShufflePos]);
    } else {
      setCurrentSongIndex((prev) => (prev - 1 + queue.length) % queue.length);
    }
  };

  const toggleShuffle = () => {
    if (isShuffled) {
      setIsShuffled(false);
      setShuffleOrder(null);
    } else {
      setIsShuffled(true);
      const indices = queue.map((_, i) => i);
      // Fisher-Yates shuffle
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffleOrder(indices);
    }
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  // Media Session API (Hardware Media Keys)
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = currentSong ? new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album,
        artwork: currentSong.artwork ? [{ src: currentSong.artwork, sizes: '512x512', type: 'image/jpeg' }] : []
      }) : null;

      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', playPrev);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
        }
      });
    }
  }, [currentSong, playNext, playPrev]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault(); // Prevent default if any
        playNext();
      } else if (e.code === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault();
        playPrev();
      } else if (e.code === 'ArrowRight') {
        // Seek forward 5s
        if (audioRef.current) {
           const newTime = Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + 5);
           audioRef.current.currentTime = newTime;
           setProgress(newTime);
        }
      } else if (e.code === 'ArrowLeft') {
        // Seek backward 5s
        if (audioRef.current) {
           const newTime = Math.max(0, audioRef.current.currentTime - 5);
           audioRef.current.currentTime = newTime;
           setProgress(newTime);
        }
      } else if (e.code === 'MediaPlayPause') {
        // Fallback if Media Session doesn't catch it (rare but possible)
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'MediaTrackNext') {
        e.preventDefault();
        playNext();
      } else if (e.code === 'MediaTrackPrevious') {
        e.preventDefault();
        playPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, playNext, playPrev]);

  // Sync shuffleOrder with queue changes (Smart Shuffle)
  useEffect(() => {
    // If shuffle is disabled, just sync the ref and clear order
    if (!isShuffled) {
        if (shuffleOrder !== null) setShuffleOrder(null);
        prevQueueRef.current = queue;
        return;
    }

    // If no shuffle order exists, create one
    if (!shuffleOrder) {
      const indices = queue.map((_, i) => i);
      // Fisher-Yates shuffle
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffleOrder(indices);
      prevQueueRef.current = queue;
      return;
    }

    // If queue hasn't changed, do nothing
    if (queue === prevQueueRef.current) return;

    // SIMPLIFIED SHUFFLE LOGIC (User Request: "do every song in the playlist in the queue but random positioning")
    // Instead of complex reconciliation, we just ensure that the shuffle order is a valid permutation of the NEW queue.
    // To keep it somewhat stable (not reshuffling everything when adding one song), we try to preserve relative order where possible,
    // but the priority is FULL COVERAGE.

    const oldQueue = prevQueueRef.current;
    const newQueue = queue;

    // If the queue size changed significantly or we just want to be safe, let's just re-shuffle or insert.
    // Actually, the most robust way to "make it do every song" is to just re-generate the shuffle order 
    // BUT we want to keep the currently playing song in place if possible.

    // Let's use a Map to track where songs moved.
    const newSongIndices = new Map<string, number[]>();
    newQueue.forEach((path, index) => {
        if (!newSongIndices.has(path)) newSongIndices.set(path, []);
        newSongIndices.get(path)?.push(index);
    });

    // Reconstruct shuffle order
    const newShuffleOrder: number[] = [];
    const usedIndices = new Set<number>();

    // 1. Try to carry over the old shuffle order if the song still exists
    if (shuffleOrder) {
        for (const oldIndex of shuffleOrder) {
            const songPath = oldQueue[oldIndex];
            if (songPath && newSongIndices.has(songPath)) {
                // Find an unused index for this song in the new queue
                const potentialIndices = newSongIndices.get(songPath)!;
                // We prefer the first available one to maintain relative stability
                // But since newSongIndices stores all indices, we need to pick one that hasn't been used.
                // To simplify, we can just pop from the list? 
                // Wait, if duplicates exist (same song multiple times), we need to be careful.
                // Let's just take the first one available.
                if (potentialIndices.length > 0) {
                    const newIndex = potentialIndices.shift()!; 
                    newShuffleOrder.push(newIndex);
                    usedIndices.add(newIndex);
                }
            }
        }
    }

    // 2. Add any songs that are in the new queue but weren't added yet (newly added songs)
    const missingIndices: number[] = [];
    for (let i = 0; i < newQueue.length; i++) {
        if (!usedIndices.has(i)) {
            missingIndices.push(i);
        }
    }

    // 3. Insert missing indices randomly
    for (const idx of missingIndices) {
        // Random position
        const randomPos = Math.floor(Math.random() * (newShuffleOrder.length + 1));
        newShuffleOrder.splice(randomPos, 0, idx);
    }

    setShuffleOrder(newShuffleOrder);
    prevQueueRef.current = newQueue;

  }, [queue, isShuffled, shuffleOrder]);

  const handlePlayNext = (songPath: string) => {
      const newQueue = [...queue];
      const insertIndex = currentSongIndex + 1;
      newQueue.splice(insertIndex, 0, songPath);
      setQueue(newQueue);
      
      if (isShuffled && shuffleOrder) {
          // Shift indices in shuffleOrder
          const newShuffleOrder = shuffleOrder.map(idx => {
              if (idx >= insertIndex) return idx + 1;
              return idx;
          });
          
          const currentShuffleIndex = newShuffleOrder.indexOf(currentSongIndex);
          // Insert the new song's index (which is insertIndex) into shuffle order after current song
          if (currentShuffleIndex !== -1) {
              newShuffleOrder.splice(currentShuffleIndex + 1, 0, insertIndex);
          } else {
              newShuffleOrder.push(insertIndex);
          }
          
          setShuffleOrder(newShuffleOrder);
          // Update ref to prevent useEffect from running reconciliation
          prevQueueRef.current = newQueue;
      }
  };

  const handleAddToQueue = (songPath: string) => {
      setQueue(prev => [...prev, songPath]);
  };

  const handleGoToArtist = (artist: string) => {
      setSelectedArtist(artist);
      setCurrentView('artist');
  };

  const handleEditPlaylist = (id: string, data: Partial<Playlist>) => {
      setPlaylists(prev => prev.map(p => 
          p.id === id ? { ...p, ...data } : p
      ));
  };

  const handleCreatePlaylist = () => {
    const name = `${t.defaultPlaylistName} #${playlists.length + 1}`;
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name,
      songs: [],
      createdAt: Date.now()
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylists(playlists.filter(p => p.id !== id));
    if (currentPlaylistId === id) {
      handleNavigate('home');
    }
  };

  const handleRenamePlaylist = (id: string, newName: string) => {
    setPlaylists(playlists.map(p => 
      p.id === id ? { ...p, name: newName } : p
    ));
  };

  const handleSortPlaylist = (playlistId: string, sortBy: 'title' | 'artist' | 'album') => {
      setPlaylists(prev => prev.map(p => {
          if (p.id === playlistId) {
              const sortedSongs = [...p.songs].sort((aPath, bPath) => {
                  const songA = songs.find(s => s.path === aPath);
                  const songB = songs.find(s => s.path === bPath);
                  
                  if (!songA || !songB) return 0;

                  if (sortBy === 'title') {
                      return (songA.title || '').localeCompare(songB.title || '');
                  } else if (sortBy === 'artist') {
                      return (songA.artist || '').localeCompare(songB.artist || '');
                  } else if (sortBy === 'album') {
                      return (songA.album || '').localeCompare(songB.album || '');
                  }
                  return 0;
              });
              return { ...p, songs: sortedSongs };
          }
          return p;
      }));
  };

  const handleNavigate = (view: 'home' | 'search' | 'settings' | 'playlist' | 'library' | 'artist', playlistId?: string) => {
    setCurrentView(view);
    if (view === 'playlist' && playlistId) {
      setCurrentPlaylistId(playlistId);
    } else {
      setCurrentPlaylistId(null);
    }
  };

  const handleArtistClick = (artist: string) => {
    setSelectedArtist(artist);
    setCurrentView('artist');
  };

  const handleDownloadSong = async (url: string) => {
    const result = await platform.downloadSong(url);
    if (result.success && result.path) {
      try {
        // Get metadata for the downloaded song
        const newSong = await platform.getSong(result.path);
        
        setSongs(prev => {
          // Avoid duplicates
          if (prev.some(s => s.path === newSong.path)) return prev;
          return [...prev, newSong];
        });
        
        // Add to queue if queue is empty
        if (queue.length === 0) {
           setQueue([newSong.path]);
        }
      } catch (error) {
        console.error("Error adding downloaded song to library:", error);
      }
    }
    return result;
  };

  const handleAddToPlaylist = (playlistId: string, songPath: string) => {
    setPlaylists(prevPlaylists => 
      prevPlaylists.map(playlist => {
        if (playlist.id === playlistId) {
          // Avoid duplicates
          if (playlist.songs.includes(songPath)) return playlist;
          return {
            ...playlist,
            songs: [...playlist.songs, songPath]
          };
        }
        return playlist;
      })
    );
  };

  const handleRemoveFromPlaylist = (playlistId: string, songPath: string) => {
    setPlaylists(prev => prev.map(p => {
        if (p.id === playlistId) {
            return { ...p, songs: p.songs.filter(s => s !== songPath) };
        }
        return p;
    }));
  };

  const handleReorderPlaylist = (playlistId: string, fromIndex: number, toIndex: number) => {
      setPlaylists(prev => prev.map(p => {
          if (p.id === playlistId) {
              const newSongs = [...p.songs];
              const [moved] = newSongs.splice(fromIndex, 1);
              newSongs.splice(toIndex, 0, moved);
              return { ...p, songs: newSongs };
          }
          return p;
      }));
  };

  const confirmDeleteSong = async () => {
    if (!songToDelete) return;
    const songPath = songToDelete;

    const success = await platform.deleteSong(songPath);
    if (success) {
      setSongs(prev => prev.filter(s => s.path !== songPath));
      setPlaylists(prev => prev.map(p => ({
          ...p,
          songs: p.songs.filter(s => s !== songPath)
      })));
      
      // Update queue if necessary
       const queueIndex = queue.indexOf(songPath);
       if (queueIndex !== -1) {
            const newQueue = queue.filter(s => s !== songPath);
            setQueue(newQueue);
            
            let nextSongIndex = -1;
            let shouldUpdateIndex = false;

            if (isShuffled && shuffleOrder) {
                const shufflePos = shuffleOrder.indexOf(queueIndex);
                
                const newShuffleOrder = shuffleOrder
                   .filter(i => i !== queueIndex)
                   .map(i => i > queueIndex ? i - 1 : i);
                
                if (currentSongIndex === queueIndex) {
                    shouldUpdateIndex = true;
                    if (newShuffleOrder.length > 0) {
                        const nextPos = shufflePos >= newShuffleOrder.length ? 0 : shufflePos;
                        nextSongIndex = newShuffleOrder[nextPos];
                    }
                }
            }

            if (currentSongIndex === queueIndex) {
                if (shouldUpdateIndex) {
                    setCurrentSongIndex(nextSongIndex);
                    if (nextSongIndex === -1) setIsPlaying(false);
                } else {
                     // Non-shuffled logic
                     if (newQueue.length === 0) {
                         setCurrentSongIndex(-1);
                         setIsPlaying(false);
                     } else if (currentSongIndex >= newQueue.length) {
                         setCurrentSongIndex(0); 
                     }
                     // else keep same index (points to next song in queue)
                }
            } else if (currentSongIndex > queueIndex) {
                setCurrentSongIndex(prev => prev - 1);
            }
       }
    }
    setSongToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleDeleteSong = (songPath: string) => {
    setSongToDelete(songPath);
    setDeleteModalOpen(true);
  };

  const handlePlayOnline = (song: Song) => {
      // Add to songs list temporarily if not exists
      setSongs(prev => {
          if (prev.some(s => s.path === song.path)) return prev;
          return [...prev, song];
      });

      // Set queue to just this song and play
      setQueue([song.path]);
      setCurrentSongIndex(0);
      setIsPlaying(true);
  };

  const getDisplaySongs = () => {
    if (currentView === 'playlist' && currentPlaylistId) {
      const playlist = playlists.find(p => p.id === currentPlaylistId);
      if (playlist) {
        return playlist.songs
          .map(path => songs.find(s => s.path === path))
          .filter((s): s is Song => !!s);
      }
      return [];
    }
    return songs;
  };

  const getPlaylistDetails = () => {
    if (currentView === 'playlist' && currentPlaylistId) {
      const playlist = playlists.find(p => p.id === currentPlaylistId);
      if (playlist) {
        return {
          title: playlist.name,
          subtitle: `${t.createdOn} ${new Date(playlist.createdAt).toLocaleDateString()}`,
          color: 'from-purple-700 to-pink-600'
        };
      }
    }
    return {
      title: t.myMusic,
      subtitle: t.defaultArtist,
      color: 'from-blue-700 to-teal-600'
    };
  };

  const displaySongs = getDisplaySongs();
  const { title, subtitle, color } = getPlaylistDetails();

  const queueSongs = useMemo(() => {
    return queue.map(path => songs.find(s => s.path === path)).filter((s): s is Song => !!s);
  }, [queue, songs]);

  return (
    <div className={`h-screen flex flex-col overflow-hidden transition-colors duration-300 ${theme}`} style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {/* Custom Title Bar Drag Region */}
      <div className="h-8 w-full fixed top-0 left-0 z-[100] drag-region" />
      
      <div className="flex-1 flex overflow-hidden p-4 pt-8 gap-4 relative">
        {/* Sidebar */}
        <div className="w-[280px] h-full">
          <Sidebar 
            onNavigate={(view, playlistId) => {
              setCurrentView(view);
              if (playlistId) setCurrentPlaylistId(playlistId);
              else setCurrentPlaylistId(null);
            }}
            currentView={currentView}
            playlists={playlists}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col overflow-hidden h-full">
        {showLyrics ? (
          <LyricsView 
             currentSong={currentSong} 
             currentTime={progress}
             onClose={() => setShowLyrics(false)}
          />
        ) : currentView === 'settings' ? (
          <Settings 
            onBack={() => handleNavigate('home')} 
            currentTheme={theme}
            onThemeChange={setTheme}
          />
        ) : currentView === 'search' ? (
          <UnifiedSearch 
            songs={songs}
            onPlayLocal={(song) => {
              setQueue([song.path]);
              setCurrentSongIndex(0);
              setIsPlaying(true);
            }}
            onPlayOnline={handlePlayOnline}
            onDownload={handleDownloadSong}
            onArtistClick={handleArtistClick}
          />
        ) : currentView === 'artist' && selectedArtist ? (
          <ArtistPage 
             artistName={selectedArtist}
             localSongs={songs}
             onBack={() => handleNavigate('search')}
             onPlayLocal={(song) => {
                setQueue([song.path]);
                setCurrentSongIndex(0);
                setIsPlaying(true);
             }}
             onPlayOnline={handlePlayOnline}
          />
        ) : currentView === 'home' ? (
           <Home 
             songs={songs}
             playlists={playlists}
             onNavigate={handleNavigate}
             onPlaySong={(index) => {
               const newQueue = songs.map(s => s.path);
               setQueue(newQueue);
               setCurrentSongIndex(index);
               setIsPlaying(true);
             }}
           />
        ) : (
          <MainContent 
            songs={displaySongs} 
            currentSongIndex={currentSongIndex}
            isPlaying={isPlaying}
            onPlaySong={(index) => {
               const newQueue = displaySongs.map(s => s.path);
               setQueue(newQueue);
               setCurrentSongIndex(index);
               setIsPlaying(true);
               // Let useEffect handle shuffle order generation
            }}
            currentTime={progress}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
            title={title}
            subtitle={subtitle}
            color={color}
            currentPlaylistId={currentPlaylistId}
            onRenamePlaylist={handleRenamePlaylist}
            onRemoveFromPlaylist={handleRemoveFromPlaylist}
            onReorderPlaylist={handleReorderPlaylist}
            onDeleteSong={handleDeleteSong}
            onPlayNext={handlePlayNext}
            onAddToQueue={handleAddToQueue}
            onGoToArtist={handleGoToArtist}
            onEditPlaylist={handleEditPlaylist}
            onSortPlaylist={handleSortPlaylist}
          />
        )}
        </div>
        
        {showQueue && (
          <Queue 
            songs={queueSongs}
            currentSongIndex={currentSongIndex}
            onClose={() => setShowQueue(false)}
            onPlaySong={(index) => {
              setCurrentSongIndex(index);
              setIsPlaying(true);
            }}
            shuffleOrder={isShuffled ? shuffleOrder : null}
          />
        )}
      </div>
      
      {currentSong && (
        <Player 
          currentSong={currentSong}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onNext={playNext}
          onPrev={playPrev}
          progress={progress}
          duration={duration}
          onSeek={handleSeek}
          volume={volume}
          onVolumeChange={setVolume}
          showLyrics={showLyrics}
          onToggleLyrics={() => setShowLyrics(!showLyrics)}
          isShuffled={isShuffled}
          onToggleShuffle={toggleShuffle}
          repeatMode={repeatMode}
          onToggleRepeat={toggleRepeat}
          showQueue={showQueue}
          onToggleQueue={() => setShowQueue(!showQueue)}
        />
      )}
      
      <ConfirmationModal 
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSongToDelete(null);
        }}
        onConfirm={confirmDeleteSong}
        title={t.deleteSong}
        message={t.deleteSongConfirm}
      />
      </div>
  );
}

export default App;
