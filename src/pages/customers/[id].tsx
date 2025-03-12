import { useParams } from "next/navigation";
import { useQuery } from "react-query";

const { id } = useParams<{ id: string }>();
const numericId = id ? parseInt(id, 10) : null;

const { data: customer, isLoading: isLoadingCustomer } = useQuery({
  queryKey: ["customer", numericId],
  queryFn: () => fetchCustomerById(numericId!),
  enabled: !!numericId,
});

const { data: purchaseCount, isLoading: isLoadingPurchaseCount } = useQuery({
  queryKey: ["customerPurchaseCount", numericId],
  queryFn: () => getCustomerPurchaseCount(numericId!),
  enabled: !!numericId,
});
