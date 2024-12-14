import Image from "next/image";

interface Token {
  url: string;
  fileName: string;
  type: string; // File type (MIME type)
}

function TokenPreview({ token }: { token: Token }) {
  const { url, fileName, type } = token;

  // Determine file type based on token URL and MIME type
  const isImage =
    type.startsWith("image/") || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
  const isVideo = type.startsWith("video/") || /\.(mp4|webm|ogg)$/i.test(url);
  const isAudio = type.startsWith("audio/") || /\.(mp3|wav|ogg)$/i.test(url);
  const isPDF = type === "application/pdf" || /\.pdf$/i.test(url);
  const isZip = type === "application/zip" || /\.zip$/i.test(url);
  const isCSV = type === "text/csv" || /\.csv$/i.test(url);
  const isExcel =
    type === "application/vnd.ms-excel" ||
    type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    /\.(xls|xlsx)$/i.test(url);

  return (
    <div className="flex flex-col w-full bg-white rounded-2xl border">
      {/* Conditionally render the file preview based on type */}
      {isImage && (
        <Image
          src={url}
          alt={`${fileName} Preview`}
          className="w-full h-auto rounded-2xl border"
        />
      )}

      {isVideo && (
        <video
          controls
          className="w-full max-h-[300px] h-auto rounded-lg border"
        >
          <source src={url} type={type} />
          Your browser does not support the video tag.
        </video>
      )}

      {isAudio && (
        <audio controls className="w-full border rounded-lg">
          <source src={url} type={type} />
          Your browser does not support the audio element.
        </audio>
      )}

      {isPDF && (
        <iframe
          src={url}
          className="w-full h-[300px] rounded-lg border"
          title={`${fileName} Preview`}
        />
      )}

      {/* Generic previews for ZIP, CSV, Excel, and other file types */}
      {isZip && (
        <div className="flex flex-col justify-center items-center p-5 border border-dashed rounded-lg text-[#d9534f] text-sm">
          <p>{fileName}</p>
          <p>(ZIP File)</p>
        </div>
      )}

      {isCSV && (
        <div className="flex flex-col justify-center items-center p-5 border border-dashed rounded-lg text-[#5cb85c] text-sm">
          <p>{fileName}</p>
          <p>(CSV File)</p>
        </div>
      )}

      {isExcel && (
        <div className="flex flex-col justify-center items-center p-5 border border-dashed rounded-lg text-[#2a9d8f] text-sm">
          <p>{fileName}</p>
          <p>(Excel File)</p>
        </div>
      )}

      {/* Fallback for other file types */}
      {!isImage &&
        !isVideo &&
        !isAudio &&
        !isPDF &&
        !isZip &&
        !isCSV &&
        !isExcel && (
          <div className="flex flex-col justify-center items-center p-5 border border-dashed rounded-lg text-[#666] text-sm">
            <p>{fileName}</p>
            <p>({type})</p>
          </div>
        )}
    </div>
  );
}

export default TokenPreview;
