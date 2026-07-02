import Image from "next/image";
import Link from "next/link";
import { imgL, popImgG } from "@/assets/images";

const SAMPLE_ITEMS = [
  { name: "لقيمات نوتيلا", size: "صغير", qty: 2, price: 10 },
  { name: "لقيمات لوتس", size: "صغير", qty: 1, price: 12 },
  { name: "لقيمات مكس (نوتيلا+لوتس)", size: "صغير", qty: 1, price: 12 },
];

const TOTAL = SAMPLE_ITEMS.reduce((s, i) => s + i.price, 0);

export default function OrderDetailsClientPage() {
  return (
    <div className="relative bg-[#51c9f4] min-h-screen overflow-x-hidden">
      {/* Background blob */}
      <div className="top-0 right-0 z-0 absolute w-[350px] max-[700px]:w-[130px] max-[991px]:w-[200px] h-full pointer-events-none">
        <Image src={imgL} alt="" fill className="object-contain object-top" />
      </div>

      {/* Main content card */}
      <div className="z-10 relative flex justify-center px-4 py-[50px] pt-[85px]">
        <div className="bg-white/[.17] backdrop-blur-[15px] mb-[50px] rounded-[30px] w-[90%] max-w-[1100px] overflow-hidden">
          <div className="mx-auto p-[20px] max-[480px]:p-[15px] pb-[30px] w-full max-w-[950px] min-h-[400px] text-white">
            <div className="mt-[20px] mb-4 text-center">
              <h1 className="text-[45px] text-white max-[480px]:text-[36px]">
                تفاصيل الطلب
              </h1>
            </div>

            {/* Order table */}
            <div className="mt-[20px] w-full overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-[#479eb6]">
                  <tr>
                    <td className="p-[5px] border border-white/20 text-[27px] max-[480px]:text-[23px] text-start">
                      المنتج
                    </td>
                    <td className="p-[5px] border border-white/20 text-[27px] max-[480px]:text-[23px] text-center">
                      الحجم
                    </td>
                    <td className="p-[5px] border border-white/20 text-[27px] max-[480px]:text-[23px] text-center">
                      الكمية
                    </td>
                    <td className="p-[5px] border border-white/20 text-[27px] max-[480px]:text-[23px] text-center">
                      السعر
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_ITEMS.map((item, idx) => (
                    <tr key={idx} className="border-white/20 border-b">
                      <td className="p-[5px] border border-white/20 text-[27px] max-[480px]:text-[23px] text-start">
                        {item.name}
                      </td>
                      <td className="p-[5px] border border-white/20 text-[27px] max-[480px]:text-[23px] text-center">
                        {item.size}
                      </td>
                      <td className="p-[5px] border border-white/20 text-[27px] max-[480px]:text-[23px] text-center">
                        {item.qty}
                      </td>
                      <td className="p-[5px] border border-white/20 text-[27px] max-[480px]:text-[23px] text-center">
                        {item.price}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="p-[5px] border-white/20 border-r" />
                    <td className="p-[5px] border-white/20 border-r" />
                    <td className="p-[5px] border-white/20 border-r" />
                    <td className="bg-[#479eb6] p-[5px] text-[27px] max-[480px]:text-[23px] text-center">
                      المجموع: {TOTAL}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer actions */}
            <div className="flex flex-wrap justify-between items-baseline gap-[10px] mt-[40px] px-4">
              <span className="text-[22px] text-white">
                ملاحظة : جميع الأسعار بالشيكل
              </span>
              <div className="flex gap-[10px] max-[480px]:gap-0">
                <Link
                  href="/menu"
                  className="relative flex justify-center items-center max-[768px]:w-[200px] min-w-[150px] max-[768px]:min-w-[140px] h-[70px] max-[768px]:h-[55px] no-underline cursor-pointer"
                >
                  <Image
                    src={popImgG}
                    alt=""
                    fill
                    className="opacity-80 object-fill rotate-[-5deg]"
                  />
                  <span className="relative text-[40px] text-white max-[768px]:text-[30px]">
                    المنيو
                  </span>
                </Link>
                <button
                  type="button"
                  className="relative flex justify-center items-center bg-transparent opacity-40 border-0 max-[768px]:w-[200px] min-w-[150px] max-[768px]:min-w-[140px] h-[70px] max-[768px]:h-[55px] cursor-pointer"
                >
                  <Image
                    src={popImgG}
                    alt=""
                    fill
                    className="object-fill rotate-[-5deg]"
                  />
                  <span className="relative text-[40px] text-white max-[768px]:text-[30px]">
                    تأكيد
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
