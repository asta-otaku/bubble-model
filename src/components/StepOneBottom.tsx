import { useState } from "react";
import back from "@/assets/back.svg";
import exportIcon from "@/assets/export.png";
import GenerateLinkButton from "./GenerateLink";
import { createUser } from "@/services/apiService";
import Image from "next/image";

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
              <div className="flex gap-2 items-center my-4">
                <select
                  className="rounded-3xl bg-white p-2 px-4 appearance-none w-[120px] text-primary placeholder:text-primary outline-none"
                  onChange={(e) =>
                    setUser({ ...user, countryCode: e.target.value })
                  }
                >
                  <option value="">--</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+1CA">🇨🇦 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+81">🇯🇵 +81</option>
                  <option value="+82">🇰🇷 +82</option>
                  <option value="+65">🇸🇬 +65</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+355">🇦🇱 +355</option>
                  <option value="+376">🇦🇩 +376</option>
                  <option value="+374">🇦🇲 +374</option>
                  <option value="+43">🇦🇹 +43</option>
                  <option value="+994">🇦🇿 +994</option>
                  <option value="+375">🇧🇾 +375</option>
                  <option value="+32">🇧🇪 +32</option>
                  <option value="+387">🇧🇦 +387</option>
                  <option value="+359">🇧🇬 +359</option>
                  <option value="+385">🇭🇷 +385</option>
                  <option value="+357">🇨🇾 +357</option>
                  <option value="+420">🇨🇿 +420</option>
                  <option value="+45">🇩🇰 +45</option>
                  <option value="+372">🇪🇪 +372</option>
                  <option value="+358">🇫🇮 +358</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+995">🇬🇪 +995</option>
                  <option value="+30">🇬🇷 +30</option>
                  <option value="+36">+36</option>
                  <option value="+354">🇮🇸 +354</option>
                  <option value="+353">🇮🇪 +353</option>
                  <option value="+39">🇮🇹 +39</option>
                  <option value="+7">🇰🇿 +7</option>
                  <option value="+371">🇱🇻 +371</option>
                  <option value="+423">🇱🇮 +423</option>
                  <option value="+370">🇱🇹 +370</option>
                  <option value="+352">🇱🇺 +352</option>
                  <option value="+389">🇲🇰 +389</option>
                  <option value="+356">🇲🇹 +356</option>
                  <option value="+373">🇲🇩 +373</option>
                  <option value="+377">🇲🇨 +377</option>
                  <option value="+382">🇲🇪 +382</option>
                  <option value="+31">🇳🇱 +31</option>
                  <option value="+47">🇳🇴 +47</option>
                  <option value="+48">🇵🇱 +48</option>
                  <option value="+351">🇵🇹 +351</option>
                  <option value="+40">🇷🇴 +40</option>
                  <option value="+7">🇷🇺 +7</option>
                  <option value="+381">🇷🇸 +381</option>
                  <option value="+421">🇸🇰 +421</option>
                  <option value="+386">🇸🇮 +386</option>
                  <option value="+34">🇪🇸 +34</option>
                  <option value="+46">🇸🇪 +46</option>
                  <option value="+41">🇨🇭 +41</option>
                  <option value="+90">🇹🇷 +90</option>
                  <option value="+380">🇺🇦 +380</option>
                  <option value="+39">🇻🇦 +39</option>
                  <option value="+54">🇦🇷 +54</option>
                  <option value="+591">🇧🇴 +591</option>
                  <option value="+55">🇧🇷 +55</option>
                  <option value="+56">🇨🇱 +56</option>
                  <option value="+57">🇨🇴 +57</option>
                  <option value="+593">🇪🇨 +593</option>
                  <option value="+592">🇬🇾 +592</option>
                  <option value="+595">🇵🇾 +595</option>
                  <option value="+51">🇵🇪 +51</option>
                  <option value="+597">🇸🇷 +597</option>
                  <option value="+598">🇺🇾 +598</option>
                  <option value="+58">🇻🇪 +58</option>
                  <option value="+93">🇦🇫 +93</option>
                  <option value="+374">🇦🇲 +374</option>
                  <option value="+994">🇦🇿 +994</option>
                  <option value="+973">🇧🇭 +973</option>
                  <option value="+880">🇧🇩 +880</option>
                  <option value="+975">🇧🇹 +975</option>
                  <option value="+673">🇧🇳 +673</option>
                  <option value="+95">🇲🇲 +95</option>
                  <option value="+855">🇰🇭 +855</option>
                  <option value="+86">🇨🇳 +86</option>
                  <option value="+357">🇨🇾 +357</option>
                  <option value="+995">🇬🇪 +995</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+62">🇮🇩 +62</option>
                  <option value="+98">🇮🇷 +98</option>
                  <option value="+964">🇮🇶 +964</option>
                  <option value="+972">🇮🇱 +972</option>
                  <option value="+81">🇯🇵 +81</option>
                  <option value="+962">🇯🇴 +962</option>
                  <option value="+7">🇰🇿 +7</option>
                  <option value="+965">🇰🇼 +965</option>
                  <option value="+996">🇰🇬 +996</option>
                  <option value="+856">🇱🇦 +856</option>
                  <option value="+961">🇱🇧 +961</option>
                  <option value="+60">🇲🇾 +60</option>
                  <option value="+960">🇲🇻 +960</option>
                  <option value="+976">🇲🇳 +976</option>
                  <option value="+977">🇳🇵 +977</option>
                  <option value="+850">🇰🇵 +850</option>
                  <option value="+968">🇴🇲 +968</option>
                  <option value="+92">🇵🇰 +92</option>
                  <option value="+63">🇵🇭 +63</option>
                  <option value="+974">🇶🇦 +974</option>
                  <option value="+966">🇸🇦 +966</option>
                  <option value="+65">🇸🇬 +65</option>
                  <option value="+82">🇰🇷 +82</option>
                  <option value="+94">🇱🇰 +94</option>
                  <option value="+963">🇸🇾 +963</option>
                  <option value="+992">🇹🇯 +992</option>
                  <option value="+66">🇹🇭 +66</option>
                  <option value="+90">🇹🇷 +90</option>
                  <option value="+993">🇹🇲 +993</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+998">🇺🇿 +998</option>
                  <option value="+84">🇻🇳 +84</option>
                  <option value="+967">🇾🇪 +967</option>
                  <option value="+213">🇩🇿 +213</option>
                  <option value="+244">🇦🇴 +244</option>
                  <option value="+229">🇧🇯 +229</option>
                  <option value="+267">🇧🇼 +267</option>
                  <option value="+226">🇧🇫 +226</option>
                  <option value="+257">🇧🇮 +257</option>
                  <option value="+238">🇨🇻 +238</option>
                  <option value="+237">🇨🇲 +237</option>
                  <option value="+236">🇨🇫 +236</option>
                  <option value="+235">🇹🇩 +235</option>
                  <option value="+269">🇰🇲 +269</option>
                  <option value="+243">🇨🇩 +243</option>
                  <option value="+253">🇩🇯 +253</option>
                  <option value="+20">🇪🇬 +20</option>
                  <option value="+240">🇬🇶 +240</option>
                  <option value="+291">🇪🇷 +291</option>
                  <option value="+251">🇪🇹 +251</option>
                  <option value="+241">🇬🇦 +241</option>
                  <option value="+220">🇬🇲 +220</option>
                  <option value="+233">🇬🇭 +233</option>
                  <option value="+224">🇬🇳 +224</option>
                  <option value="+245">🇬🇼 +245</option>
                  <option value="+225">🇨🇮 +225</option>
                  <option value="+254">🇰🇪 +254</option>
                  <option value="+266">🇱🇸 +266</option>
                  <option value="+231">🇱🇷 +231</option>
                  <option value="+218">🇱🇾 +218</option>
                  <option value="+261">🇲🇬 +261</option>
                  <option value="+265">🇲🇼 +265</option>
                  <option value="+223">🇲🇱 +223</option>
                  <option value="+222">🇲🇷 +222</option>
                  <option value="+230">🇲🇺 +230</option>
                  <option value="+212">🇲🇦 +212</option>
                  <option value="+258">🇲🇿 +258</option>
                  <option value="+264">🇳🇦 +264</option>
                  <option value="+227">🇳🇪 +227</option>
                  <option value="+234">🇳🇬 +234</option>
                  <option value="+242">🇨🇬 +242</option>
                  <option value="+250">🇷🇼 +250</option>
                  <option value="+239">🇸🇹 +239</option>
                  <option value="+221">🇸🇳 +221</option>
                  <option value="+248">🇸🇨 +248</option>
                  <option value="+232">🇸🇱 +232</option>
                  <option value="+252">🇸🇴 +252</option>
                  <option value="+27">🇿🇦 +27</option>
                  <option value="+211">🇸🇸 +211</option>
                  <option value="+249">🇸🇩 +249</option>
                  <option value="+255">🇹🇿 +255</option>
                  <option value="+228">🇹🇬 +228</option>
                  <option value="+216">🇹🇳 +216</option>
                  <option value="+256">🇺🇬 +256</option>
                  <option value="+260">🇿🇲 +260</option>
                  <option value="+263">🇿🇼 +263</option>
                </select>
                <input
                  name="phone"
                  placeholder="(404) 291-4982"
                  onChange={(e) =>
                    setUser({
                      ...user,
                      phone: e.target.value,
                    })
                  }
                  className="rounded-3xl bg-white p-2 px-4 w-full text-primary placeholder:text-[#7E7E7E] outline-none"
                />
              </div>
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
