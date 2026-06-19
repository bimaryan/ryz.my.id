import { useEffect } from "react";
import { useDetailedAnalytics } from "@/hooks/useDetailedAnalytics";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SEO from "@/components/SEO";
import {
  BarChart3,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export default function AnalyticsPage() {
  const { data, fetchAnalytics, isLoading } = useDetailedAnalytics();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getDeviceIcon = (device) => {
    const d = device.toLowerCase();
    if (d.includes("mobile"))
      return <Smartphone className="h-5 w-5 text-primary-400" />;
    if (d.includes("tablet"))
      return <Tablet className="h-5 w-5 text-accent-400" />;
    return <Monitor className="h-5 w-5 text-slate-400" />;
  };

  const getTotalClicks = () => {
    return data.devices.reduce((acc, curr) => acc + curr.value, 0);
  };

  return (
    <DashboardLayout>
      <SEO title="Analytics | RYZ Shortlink" />

      <div className="flex-1 w-full max-w-7xl mx-auto animate-fade-in-up">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
                Analitik
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Wawasan mendetail tentang audiens dan performa link Anda.
              </p>
            </div>
            <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 px-6 py-4 flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 text-[#0b5cff] rounded-2xl shadow-sm">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">
                  Total Klik
                </p>
                <p className="text-2xl font-extrabold text-slate-900">
                  {getTotalClicks()}
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin h-8 w-8 border-2 border-[#0b5cff] border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Distribution */}
              <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 p-6 sm:p-8">
                <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Smartphone className="h-6 w-6 text-slate-400" /> Perangkat
                </h2>
                {data.devices.length === 0 ? (
                  <p className="text-slate-500 text-center py-8 font-medium">
                    Belum ada data yang tersedia.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {data.devices.map((device) => {
                      const percentage = Math.round(
                        (device.value / getTotalClicks()) * 100,
                      );
                      return (
                        <div key={device.name}>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(device.name)}
                              <span className="text-slate-700 capitalize font-semibold">
                                {device.name}
                              </span>
                            </div>
                            <span className="text-slate-900 font-bold">
                              {device.value}{" "}
                              <span className="text-slate-400 text-sm ml-1 font-medium">
                                ({percentage}%)
                              </span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                              className="bg-[#0b5cff] h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Referrers */}
              <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 p-6 sm:p-8">
                <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Globe className="h-6 w-6 text-slate-400" /> Sumber Rujukan Teratas
                </h2>
                {data.referrers.length === 0 ? (
                  <p className="text-slate-500 text-center py-8 font-medium">
                    Belum ada data yang tersedia.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.referrers.map((ref, idx) => (
                      <div
                        key={ref.name}
                        className="flex items-center justify-between p-3 rounded hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                            {idx + 1}
                          </div>
                          <span className="text-slate-800 font-semibold">
                            {ref.name}
                          </span>
                        </div>
                        <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-700 font-bold text-sm">
                          {ref.value} klik
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Clicks Activity */}
              <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 lg:col-span-2 overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-slate-100 bg-white">
                  <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                    <Clock className="h-6 w-6 text-slate-400" /> Log Klik Terbaru
                  </h2>
                </div>
                {data.recentClicks.length === 0 ? (
                  <p className="text-slate-500 text-center py-8 font-medium">
                    Belum ada klik yang tercatat.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="text-xs uppercase bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                        <tr>
                          <th className="px-6 sm:px-8 py-5">Waktu</th>
                          <th className="px-6 sm:px-8 py-5">Link</th>
                          <th className="px-6 sm:px-8 py-5">Lokasi (IP)</th>
                          <th className="px-6 sm:px-8 py-5">Perangkat / Browser</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.recentClicks.map((click) => (
                          <tr
                            key={click.id}
                            className="hover:bg-slate-50/80 transition-all duration-300 group"
                          >
                            <td className="px-6 sm:px-8 py-5 font-mono text-xs whitespace-nowrap text-slate-500">
                              {new Date(click.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 sm:px-8 py-5">
                              <span className="text-slate-900 font-bold block">
                                {click.linkTitle}
                              </span>
                              <span className="text-[#0b5cff] font-medium text-xs">
                                /{click.shortCode}
                              </span>
                            </td>
                            <td className="px-6 sm:px-8 py-5">
                              <span className="font-mono text-xs text-slate-500">
                                {click.ip_address || "Unknown"}
                              </span>{" "}
                              <br />
                              <span className="text-xs font-bold text-slate-700 uppercase">
                                {click.country || "-"}
                              </span>
                            </td>
                            <td className="px-6 sm:px-8 py-5">
                              <span className="block capitalize font-bold text-slate-800">
                                {click.device_type || "Desktop"}
                              </span>
                              <span
                                className="text-xs text-slate-500 truncate max-w-[200px] block font-medium"
                                title={click.user_agent}
                              >
                                {click.user_agent
                                  ? click.user_agent.split(" ")[0]
                                  : "Unknown Browser"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
