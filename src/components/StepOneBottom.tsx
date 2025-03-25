import { useState } from "react";
import back from "@/assets/back.svg";
import exportIcon from "@/assets/export.png";
import GenerateLinkButton from "./GenerateLink";
import { createUser } from "@/services/apiService";
import Image from "next/image";
import CountryCode from "./CountryCode";

function StepOneBottom({
  disabledState,
  linkGenerated,
  isGenerating,
  handleCreateBubble,
  step,
  setStep,
  setIsGenerating,
  setLinkGenerated,
  setUserPhone,
}: {
  disabledState: boolean;
  linkGenerated: boolean;
  isGenerating: boolean;
  handleCreateBubble: () => Promise<{ bubbleId: string | null }>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setLinkGenerated: React.Dispatch<React.SetStateAction<boolean>>;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  setUserPhone: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [user, setUser] = useState({
    name: "",
    phone: "",
    countryCode: "",
  });
  const [code, setCode] = useState("");
  const handleCreateUser = async () => {
    try {
      if (!user.name || !user.phone) {
        return;
      }
      const res = await createUser({
        name: user.name,
        phone: user.countryCode + user.phone,
      });
      if (res) {
        setUserPhone(user.countryCode + user.phone);
        setStep(3);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user");
    }
  };

  return (
    <div className="absolute bottom-12">
      {
        {
          0: (
            <button
              onClick={() => setStep(1)}
              disabled={disabledState}
              className={`bg-[#F3F3F3BF] text-primary px-4 py-2.5 rounded-full flex items-center gap-2 font-semibold ${
                disabledState ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              <Image src={exportIcon} alt="plus icon" className="w-3.5 h-4" />
              Share an idea
            </button>
          ),
          1: (
            <div className="bg-[#F3F3F3BF] w-[320px] p-6 rounded-2xl">
              <h2 className="text-primary font-bold text-xl max-w-xs w-full text-center">
                What's your name?
              </h2>
              <p className="text-[#7E7E7E] text-sm text-center">
                We'll send you a copy of your link so you can easily find it in
                the future!
              </p>
              <input
                name="name"
                placeholder="Your name..."
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="rounded-3xl bg-white p-2 px-4 w-full text-primary placeholder:text-[#7E7E7E] outline-none my-4"
              />
              <button
                onClick={() => {
                  if (user.name) {
                    setStep(2);
                  }
                }}
                className="bg-[#191919CC] text-white rounded-3xl py-3 px-4 w-full font-semibold"
              >
                Continue
              </button>
            </div>
          ),
          2: (
            <div className="bg-[#F3F3F3BF] w-[320px] p-6 rounded-2xl">
              <h2 className="text-primary font-bold text-xl max-w-xs w-full text-center">
                What's your number?
              </h2>
              <p className="text-[#7E7E7E] text-sm text-center">
                We'll send you a copy of your link so you can easily find it in
                the future!
              </p>
              <CountryCode user={user} setUser={setUser} />
              <button
                onClick={() => {
                  handleCreateUser();
                }}
                className="bg-[#191919CC] text-white rounded-3xl py-3 px-4 w-full font-semibold"
              >
                Continue
              </button>
            </div>
          ),
          3: (
            <div className="bg-[#F3F3F3BF] w-[320px] p-6 rounded-2xl relative">
              <Image
                src={back}
                alt="back"
                className="absolute top-8 left-4 cursor-pointer"
                onClick={() => setStep(2)}
              />
              <h2 className="text-primary font-bold text-xl max-w-xs w-full text-center">
                Enter verification code
              </h2>
              <p className="text-[#7E7E7E] text-[15px] text-center">
                Enter the verification code we just sent to your phone number
              </p>
              <input
                name="code"
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="rounded-3xl bg-white p-2 px-4 w-full text-primary placeholder:text-[#7E7E7E] text-center placeholder:text-center outline-none my-4"
              />
              <button
                onClick={() => {
                  if (code === "123456") {
                    setStep(4);
                  } else {
                    alert("Invalid code");
                  }
                }}
                className="bg-[#191919CC] text-white rounded-3xl py-3 px-4 w-full font-semibold"
              >
                Continue
              </button>
            </div>
          ),
          4: (
            <GenerateLinkButton
              linkGenerated={linkGenerated}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              setLinkGenerated={setLinkGenerated}
              handleCreateBubble={handleCreateBubble}
            />
          ),
        }[step]
      }
    </div>
  );
}

export default StepOneBottom;
