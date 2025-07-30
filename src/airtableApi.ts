const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const PRODUCTS_TABLE = "Products";
const CUSTOMERS_TABLE = "Customers";
const ORDERS_TABLE = "Orders";
const SALES_TABLE = "Sales";

export const fetchOrders = async (): Promise<Order[]> => {
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${ORDERS_TABLE}`,
    {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    }
  );
  const data = await res.json();
  return data.records;
};

export const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${PRODUCTS_TABLE}`,
    {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    }
  );
  const data = await res.json();
  return data.records.filter(
    (record: Product) =>
      record.fields["Show in store"] && record.fields["Price per unit"]
  );
};

export const fetchCustomers = async (): Promise<Customer[]> => {
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${CUSTOMERS_TABLE}`,
    {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    }
  );
  const data = await res.json();
  return data.records.filter(
    (record: Customer) => record.fields["Name and Surname"]
  );
};

export const createSale = async (productId: string, quantity: number) => {
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${SALES_TABLE}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Product: [productId],
          Quantity: quantity,
        },
      }),
    }
  );
  const data = await res.json();
  return data;
};

export const createOrder = async (customerId: string, saleIds: string[]) => {
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${ORDERS_TABLE}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Customer: [customerId],
          "Products Sold": saleIds,
        },
      }),
    }
  );
  const data = await res.json();
  return data;
};
