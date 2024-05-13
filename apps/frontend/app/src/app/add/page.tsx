"use client";

const Add = () => {
    /* page where you can upload lyrics and song titles to process and add to the database*/

    

  return (
    <main className="flex h-screen w-screen flex-row items-center justify-center gap-10">
        <div className="flex flex-col gap-4 ">
            <h2 className="text-4xl font-bold">Upload</h2>
            <p className="text-lg font-medium">Upload individual lyrics for a song directly or upload csv with columns "title", "artist", "album" for processing</p>
            <div className="flex-col ">
                <form className="flex flex-col gap-4">
                    <input name="title" type="text" placeholder="Title" className="input"/>
                    <input name="artist" type="text" placeholder="Artist" className="input"/>
                    <input name="album" type="text" placeholder="Album" className="input"/>
                    <textarea name="lyrics" placeholder="Lyrics" className="input h-60"/>
                </form>
            </div>
        </div>
    </main>
  );
};

export default Add;
