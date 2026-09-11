import { useQuery } from "@tanstack/react-query";
import { StoreIcon } from "lucide-react";
import { vendorApi } from "../lib/api";
import { formatDate } from "../lib/utils";

function VendorsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["vendors"], queryFn: vendorApi.getAll });
  const vendors = data?.vendors || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vendors</h1>
        <p className="text-base-content/70 mt-1">{vendors.length} approved vendor accounts</p>
      </div>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {isLoading ? <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div> : vendors.length === 0 ? <div className="text-center py-12 text-base-content/60"><StoreIcon className="mx-auto size-10 mb-3" /><p className="text-xl font-semibold">No vendors yet</p><p className="text-sm mt-1">Promote a customer to give them a storefront.</p></div> : <div className="overflow-x-auto"><table className="table"><thead><tr><th>Vendor</th><th>Email</th><th>Joined</th></tr></thead><tbody>{vendors.map((vendor) => <tr key={vendor._id}><td className="font-semibold">{vendor.name}</td><td>{vendor.email}</td><td className="text-sm opacity-60">{formatDate(vendor.createdAt)}</td></tr>)}</tbody></table></div>}
        </div>
      </div>
    </div>
  );
}

export default VendorsPage;