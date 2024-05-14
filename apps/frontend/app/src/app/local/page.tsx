"use client";
import { use, useEffect, useState } from "react";
import MusicCard from "@/components/card/MusicCard";

type Song = {
  id: number;
  title: string;
  artist: string;
  thing: string;
  category: string;
  url: string;
};

const Local = () => {
  const songs = [
    {
      id: 0,
      title: "Layla",
      artist: "Eric Clapton",
      thing: "Layla",
      category: "Name",
      url: "https://cdns-preview-d.dzcdn.net/stream/c-dfb2073f9912a7760ea304a2396be4ef-3.mp3",
    },
    {
      id: 1,
      title: "Alison",
      artist: "Elvis Costello",
      thing: "Alison",
      category: "Name",
      url: "https://cdns-preview-e.dzcdn.net/stream/c-efaf27c0a5d301aceba4e455f4a32425-6.mp3",
    },
    {
      id: 2,
      title: "Don't look back in anger",
      artist: "Oasis",
      thing: "Sally",
      category: "Name",
      url: "https://cdns-preview-f.dzcdn.net/stream/c-f60afd94f85abdd4ccf7614209ca6ff7-3.mp3",
    },
    {
      id: 3,
      title: "Lola",
      artist: "The Kinks",
      thing: "Lola",
      category: "Name",
      url: "https://cdns-preview-4.dzcdn.net/stream/c-455f9ee97099c538dd5fe541332f7e61-4.mp3",
    },
    {
      id: 4,
      title: "Valerie",
      artist: "Amy Winehouse",
      thing: "Valerie",
      category: "Name",
      url: "https://cdns-preview-7.dzcdn.net/stream/c-74fb75139d912676b474e32994c22d28-6.mp3",
    },
  ];

  const [currentSong, setCurrentSong] = useState<number | null>();
  const [audios, setAudios] = useState<HTMLAudioElement[]>([]);

  useEffect(() => {
    const audioElements = songs.map((song) => {
      const audio = new Audio(song.url);
      audio.load();
      console.log(song.id, song.url, audio);
      return audio;
    });
    setAudios(audioElements);

    console.log("audioElements", audioElements);

    return () => {
      audioElements.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

  useEffect(() => {
    return () => {
      audios.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [audios]);

  const StopSong = (id: number) => {
    audios[id].pause();
    audios[id].currentTime = 0;
    setCurrentSong(null);
  };

  const startSong = (id: number) => {
    setCurrentSong(id);
    audios[id].play();
  };

  useEffect(() => {
    // update current song when currensong ends
    if (currentSong != null) {
      audios[currentSong].addEventListener("ended", () => {
        setCurrentSong(null);
      });
    }
  }, [currentSong, audios]);

  //time left on song hase to update when song is playing
  const [timeLeft, setTimeLeft] = useState<number>(0);
  useEffect(() => {
    if (currentSong != null) {
      audios[currentSong].addEventListener("timeupdate", () => {
        setTimeLeft(
          Math.floor(
            audios[currentSong].duration - audios[currentSong].currentTime
          )
        );
      });
    }
  }, [currentSong, audios]);

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center gap-10">
      <div className=" flex flex-row gap-4">
        {songs.map((song, index) => (
          <div
            className={` h-5 w-5 rounded-full border-4 ${
              currentSong === song.id ? "bg-white/50" : "bg-white/10"
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
        {songs.map((song, index) => (
          <MusicCard
            id={song.id}
            key={index}
            title={song.title}
            description={song.artist}
            thing={song.thing}
            category={song.category}
            keyValue={(index + 1).toString()}
            currentSongId={currentSong}
          />
        ))}
      </div>
      <div>
        {currentSong != null && (
          <div className="flex flex-col items-center justify-center gap-5">
            {timeLeft > 0 && <p>{timeLeft}</p>}
          </div>
        )}
        {currentSong == null ? (
          <button
            className="flex flex-col items-center justify-center gap-5"
            onClick={() => startSong(0)}
          >
            Start
          </button>
        ) : (
          <button
            className="flex flex-col items-center justify-center gap-5"
            onClick={() => StopSong(0)}
          >
            Stop
          </button>
        )}
      </div>
    </main>
  );
};

export default Local;
