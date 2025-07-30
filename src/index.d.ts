type Product = {
  id: string;
  fields: {
    Product: string;
    "Price per unit": number;
    Unit: string;
    "Show in store": boolean;
  };
};

type Customer = {
  id: string;
  fields: { "Name and Surname": string; Email: string };
};

type Order = {
  id: string;
  fields: {
    Customer: string[];
    "Products Sold": string[];
  };
};
