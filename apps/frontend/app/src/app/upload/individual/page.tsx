"use client";

import { useApi } from "@/hooks/api";
import React, { useState } from "react";

type Entity = {
  text: string;
  value: string;
  score: number;
  line_text: string;
  line_index: number;
  start: number;
  end: number;
};

const Individual = () => {
  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    album: "",
    lyrics: "",
  });

  const [nerResult, setNerResult] = useState<[] | null>();
  const [gptResult, setGptResult] = useState<[] | null>();

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const api = useApi();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the form from refreshing the page
    console.log("Sending data to the server:", formData); // Logging data to send

    const payload = {
      name: formData.name,
      artist: formData.artist,
      album: formData.album,
      lyrics: formData.lyrics,
    };

    // Send the data to the server
    try {
      const response = await api.post("/song/process/ner", payload);
      console.log("Server response:", response);

      if (response.data.length == 0) {
        console.error("No NER result to process, try a different song.");
        return;
      } else {
        setNerResult(response.data);
      }
    } catch (error) {
      console.error("Failed to upload data:", error);
    }
  };

  const handleGptSubmit = async () => {
    try {
      if (!nerResult) {
        console.error("No GPT result to process, try a different song.");
        return;
      }
      const response = await api.post("/song/process/gpt", nerResult);

      if (response.data.length == 0) {
        console.error("No GPT result to process");
        return;
      } else {
        setGptResult(response.data);
        console.log("Server response:", response);
      }
    } catch (error) {
      console.error("Failed to upload data:", error);
    }
  };

  const handleUpload = async () => {
    try {
      if (!gptResult) {
        console.error("No GPT result to process");
        return;
      }
      gptResult.forEach(async (entity: Entity) => {
        console.log("Entity:", entity);
        const response = await api.post("/song/upload", {
          name: formData.name,
          artist: formData.artist,
          album: formData.album,
          lyrics: formData.lyrics,
          entity_text: entity.text,
          entity_value: entity.value,
          entity_score: entity.score,
          entity_line_text: entity.line_text,
          entity_line_index: entity.line_index,
          entity_start: entity.start,
          entity_end: entity.end,
          gpt_verified: true,
        });
        console.log("Server response:", response);
      });
      setFormData({
        name: "",
        artist: "",
        album: "",
        lyrics: "",
      });
      setNerResult(null);
      setGptResult(null);
    } catch (error) {
      console.error("Failed to upload data:", error);
    }
  };

  return (
    <main className="flex h-screen w-screen flex-row items-center justify-center gap-10">
      {!nerResult ?? nerResult?.length == 0 ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl font-bold self-center">Upload</h2>
          <p className="text-lg font-medium">
            Upload lyrics to a song and get the Named Entity Recognition (NER)
          </p>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              name="name"
              type="text"
              placeholder="Title"
              className="input"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              name="artist"
              type="text"
              placeholder="Artist"
              className="input"
              value={formData.artist}
              onChange={handleChange}
            />
            <input
              name="album"
              type="text"
              placeholder="Album"
              className="input"
              value={formData.album}
              onChange={handleChange}
            />
            <textarea
              name="lyrics"
              placeholder="Lyrics"
              className="input h-60"
              value={formData.lyrics}
              onChange={handleChange}
            />
            <button
              type="submit"
              className="btn bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
            >
              Submit
            </button>
          </form>
        </div>
      ) : (
        <div>
          <div className="flex flex-col gap-4 justify-center items-center mb-5">
            <h2 className="text-4xl font-bold">Result</h2>
            <p className="text-lg font-medium">
              Named Entity Recognition (NER) result
            </p>
            <p>
              {"Found " +
                nerResult?.length +
                " potential category words in " +
                formData.name}
            </p>
            <div className="flex-row items-center justify-center">
              <button className="btn" onClick={handleGptSubmit}>
                AI review
              </button>
            </div>
          </div>
          <div>
            {gptResult && (
              <div className="flex flex-col items-center justify-center">
                <h2 className="text-4xl font-bold">GPT-3</h2>
                <p className="text-lg font-medium">GPT-3 result</p>
                <p>
                  {"Confirmed " +
                    gptResult.length +
                    " category words in " +
                    formData.name}
                </p>
                <button className="btn" onClick={handleUpload}>
                  Upload
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default Individual;
