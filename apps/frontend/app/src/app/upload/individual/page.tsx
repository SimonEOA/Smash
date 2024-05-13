"use client";

import React, { useState } from "react";

const Individual = () => {
  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    album: "",
    lyrics: "",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the form from refreshing the page
    console.log("Sending data to the server:", formData); // Logging data to send

    try {
      const response = await fetch("http://127.0.0.1:8000/songs/test_add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Success:", result);
      alert("Song added successfully!"); // Provide user feedback
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add song"); // Provide user feedback on error
    }
  };

  return (
    <main className="flex h-screen w-screen flex-row items-center justify-center gap-10">
      <div className="flex flex-col gap-4">
        <h2 className="text-4xl font-bold">Upload</h2>
        <p className="text-lg font-medium">
          Upload individual lyrics for a song directly or upload csv with
          columns "title", "artist", "album" for processing
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
    </main>
  );
};

export default Individual;
