
import { FaWhatsapp, FaWeixin } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
export default function Footer() {
    return (
      <footer className="mt-20 border-t border-[#e7edf5] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
  
            {/* LEFT */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <img
                  src="/lunalogo.png"
                  alt="Luna Education"
                  className="w-14 h-14 object-contain"
                />
  
                <div>
                  <h2 className="text-2xl font-serif text-[#0b234a]">
                    LUNA
                  </h2>
  
                  <p className="text-sm text-slate-500 -mt-1">
                    Education
                  </p>
                </div>
              </div>
  
              <p className="text-slate-500 leading-8 max-w-sm">
                Personalized international education support
                for students in Singapore, Japan, and beyond.
              </p>
            </div>
  
            {/* CENTER */}
            <div>
              <h3 className="text-[#0b234a] font-semibold mb-5">
                Quick Links
              </h3>
  
              <div className="space-y-3 text-slate-500">
                <p>Home</p>
                <p>Tutors</p>
                <p>Programmes</p>
                <p>Contact</p>
              </div>
            </div>
  {/* RIGHT */}
<div>
  <h3 className="text-[#0b234a] font-semibold mb-5">
    Contact
  </h3>

  <div className="space-y-5">

    {/* WeChat */}
    <div className="flex items-center gap-4">
      <FaWeixin className="shrink-0 text-[24px] text-[#07C160]" />

      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
          WeChat
        </p>

        <p className="text-base text-[#0b234a]">
          luna.education
        </p>
      </div>
    </div>

    {/* WhatsApp */}
    <div className="flex items-center gap-4">
      <FaWhatsapp className="shrink-0 text-[22px] text-[#25D366]" />

      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
          WhatsApp
        </p>

        <p className="text-base text-[#0b234a]">
          +65 94235165
        </p>
      </div>
    </div>

    {/* Email */}
    <div className="flex items-center gap-4">
      <MdEmail className="shrink-0 text-[20px] text-slate-500" />

      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
          Email
        </p>

        <p className="break-all text-base text-[#0b234a]">
          admin@lunastudies.com
        </p>
      </div>
    </div>

  </div>
  </div>
</div>
          <div className="border-t border-[#eef2f7] mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
  
            <p className="text-sm text-slate-400">
              © 2026 Luna Education. All rights reserved.
            </p>
  
            <p className="text-sm text-slate-400">
              Singapore · Tokyo · China · Online 
            </p>
  
          </div>
        </div>
      </footer>
    );
  }