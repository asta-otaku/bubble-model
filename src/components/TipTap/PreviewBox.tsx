import Image from "next/image";

function PreviewBox({ file }: { file: File | null }) {
  const fileName = file?.name;
  const fileType = file?.type;

  // Determine file type
  const isImage = fileType?.startsWith("image/");
  const isVideo = fileType?.startsWith("video/");
  const isAudio = fileType?.startsWith("audio/");
  const isPDF = fileType === "application/pdf";
  const isZip = fileType === "application/zip" || fileName?.endsWith(".zip");
  const isCSV = fileType === "text/csv" || fileName?.endsWith(".csv");
  const isExcel =
    fileType === "application/vnd.ms-excel" ||
    fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  // Create URL for previewing the file
  const fileURL = file ? URL.createObjectURL(file) : "";

  return (
    <div className="flex flex-col w-full max-w-xs p-3 bg-white rounded-2xl border">
      {/* Conditionally render the file preview based on type */}
      {isImage && (
        <Image
          src={fileURL}
          alt={`${fileName} Preview`}
          width={200}
          height={200}
          className="w-full h-auto rounded-2xl border"
        />
      )}

      {isVideo && (
        <video
          controls
          className="w-full max-h-[200px] h-auto rounded-lg mt-2 border"
        >
          <source src={fileURL} type={fileType} />
          Your browser does not support the video tag.
        </video>
      )}

      {isAudio && (
        <audio controls className="w-full mt-2 border rounded-lg">
          <source src={fileURL} type={fileType} />
          Your browser does not support the audio element.
        </audio>
      )}

      {isPDF && (
        <iframe
          src={fileURL}
          className="w-full h-[400px] rounded-lg border mt-2"
          title={`${fileName} Preview`}
        />
      )}

      {/* Generic previews for ZIP, CSV, Excel, and other file types */}
      {isZip && (
        <div
          className={`flex flex-col justify-center items-center p-5 border border-dashed rounded-lg text-[#d9534f] text-sm mt-2`}
        >
          <p>{fileName}</p>
          <p>(ZIP File)</p>
        </div>
      )}

      {isCSV && (
        <div
          className={`flex flex-col justify-center items-center p-5 border border-dashed rounded-lg text-[#5cb85c] text-sm mt-2`}
        >
          <p>{fileName}</p>
          <p>(CSV File)</p>
        </div>
      )}

      {isExcel && (
        <div
          className={`flex flex-col justify-center items-center p-5 border border-dashed rounded-lg text-[#2a9d8f] text-sm mt-2`}
        >
          <p>{fileName}</p>
          <p>(Excel File)</p>
        </div>
      )}

      {/* If the file is not an image, video, audio, PDF, ZIP, CSV, or Excel, show a generic icon */}
      {!isImage &&
        !isVideo &&
        !isAudio &&
        !isPDF &&
        !isZip &&
        !isCSV &&
        !isExcel && (
          <div className="flex flex-col justify-center items-center p-5 border border-dashed rounded-lg text-[#666] text-sm mt-2">
            <p>{fileName}</p>
            <p>({fileType})</p>
          </div>
        )}
    </div>
  );
}

export default PreviewBox;
