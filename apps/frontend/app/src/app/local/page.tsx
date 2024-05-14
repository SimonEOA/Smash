"use client";
import { useEffect, useState } from "react";
import MusicCard from "@/components/card/MusicCard";
import { useApi } from "@/hooks/api";
import Link from "next/link";

type SongPlayable = {
  name: string;
  artist: string;
  album: string;
  deezer_artist: string;
  deezer_album: string;
  deezer_name: string;
  preview_url: string;
  entity_text: string;
  entity_value: string;
  entity_line_text: string;
};

// Fisher-Yates Shuffle Algorithm
function shuffleArray(array: number[]): number[] {
  for (let i = array.length - 1; i > 0; i--) {
    // Generate a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements at indices i and j
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const Local = () => {
  const api = useApi();
  // use api to fetch songs from backend
  const [songs, setSongs] = useState<[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [currentSong, setCurrentSong] = useState<number>(0);
  const [audios, setAudios] = useState<HTMLAudioElement[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // fetch songs from backend and shuffle the playing order array
  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get("song/deezer");
      if (response.data) {
        setSongs(response.data);
        const orderArray = Array.from(Array(response.data.length).keys());
        setOrder(shuffleArray(orderArray));
      }
    };
    fetchData();
  }, [api]);

  useEffect(() => {
    const audioElements = songs.map((song: SongPlayable) => {
      const audio = new Audio(song.preview_url);
      audio.load();
      console.log(song.name, song.preview_url, audio);
      return audio;
    });
    setAudios(audioElements);

    return () => {
      audioElements.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [songs]);

  useEffect(() => {
    return () => {
      audios.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [audios]);

  const startSong = () => {
    const songId = order[currentSong];
    audios[songId].play();
    setIsPlaying(true);
  };

  const StopSong = (index: number) => {
    const songId = order[index];
    audios[songId].pause();
    audios[songId].currentTime = 0;
    setCurrentSong(index + 1);
    setIsPlaying(false);
  };

  useEffect(() => {
    // update current song when currensong ends
    if (
      currentSong != null &&
      isPlaying &&
      audios &&
      audios[order[currentSong]]
    ) {
      audios[order[currentSong]].addEventListener("ended", () => {
        setCurrentSong(currentSong + 1);
        setIsPlaying(false);
      });
    }
  }, [currentSong, audios, isPlaying, order]);

  //time left on song hase to update when song is playing
  const [timeLeft, setTimeLeft] = useState<number>(0);
  useEffect(() => {
    if (isPlaying) {
      const index = order[currentSong];
      audios[index].addEventListener("timeupdate", () => {
        setTimeLeft(
          Math.floor(audios[index].duration - audios[index].currentTime)
        );
      });
    }
  }, [currentSong, audios, isPlaying, order]);

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center gap-10">
      <div className=" flex flex-row gap-4">
        {audios.map((song, index) => (
          <div
            className={` h-5 w-5 rounded-full border-4 ${
              currentSong === index ? "bg-white/50" : "bg-white/10"
            } `}
            key={index}
          />
        ))}
      </div>
      <div>
        <h2 className="text-center text-6xl font-bold">Preview</h2>
        <p className="text-center text-2xl font-bold">Game in development</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-5">
        {songs.map((song: SongPlayable, index) => (
          <MusicCard
            id={index}
            key={index}
            title={song.name}
            description={song.deezer_artist + " - " + song.deezer_album}
            thing={song.entity_text}
            category={song.entity_value}
            keyValue={(index + 1).toString()}
            currentSongId={order[currentSong]}
            isPlaying={isPlaying}
          />
        ))}
      </div>
      {currentSong < songs.length ? (
        <div>
          {isPlaying && (
            <div className="flex flex-col items-center justify-center gap-5">
              {timeLeft > 0 && <p>{timeLeft}</p>}
            </div>
          )}
          {!isPlaying ? (
            <button
              className="flex flex-col items-center justify-center gap-5"
              onClick={() => startSong()}
            >
              Start
            </button>
          ) : (
            <button
              className="flex flex-col items-center justify-center gap-5"
              onClick={() => StopSong(currentSong)}
            >
              Stop
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3">
          <h2 className="text-center text-2xl font-bold">Game Ended</h2>
          <p className="text-center text-xl font-bold">
            Upload new songs to play more!
          </p>
          <Link className="btn" href="/upload/individual">
            Upload New
          </Link>
        </div>
      )}
    </main>
  );
};

export default Local;
