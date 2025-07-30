import React, { useEffect, useState } from "react";
import {
  createOrder,
  createSale,
  fetchCustomers,
  fetchProducts,
} from "./airtableApi";

import styled from "@emotion/styled";
import QRCode from "react-qr-code";
import { css } from "@emotion/css";

const Select = styled.select`
  width: 100%;
  margin-bottom: 16px;
  padding: 0.6em 1.2em;
  border-radius: 8px;
  border: 1px solid #ccc;
`;

const Button = styled.button`
  border-radius: 8px;
  border: 1px solid #ccc;
  padding: 0.6em 1.2em;
  display: inline-block;
  background-color: #f9f9f9;

  &:hover:not(:disabled) {
    background-color: #e6e6e6;
  }
`;

const Input = styled.input`
  padding: 0.6em 1.2em;
  border-radius: 8px;
  border: 1px solid #ccc;
`;

const UL = styled.ul`
  list-style: none;
  border-left: 5px solid #eee;
  margin: 0;
  padding: 0.5rem 0 0.5rem 2rem;
`;

const LI = styled.li`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  margin-top: 1rem;
`;

const ProductName = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
`;

const Quantity = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  margin-top: 8px;
`;

const TDNumber = styled.td`
  text-align: right;
  font-family: monospace;
  font-size: 1.2em;
`;

const SuccessContainer = styled.div`
  margin-top: 10px;
  background-color: #e6ffe6;
  padding: 1rem;
  border-radius: 8px;
  width: 100%;
`;

const P = styled.p`
  padding-bottom: 0.5rem;
`;

const CartFooter = styled.div`
  margin-top: 20px;
  gap: 1rem;
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: top;
`;

const AppContainer = styled.form`
  max-width: 500px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: sans-serif;
`;

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Map<string, number | "">>(new Map());
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");

  useEffect(() => {
    fetchProducts().then(setProducts);
    fetchCustomers().then(setCustomers);
  }, []);

  const toggleProduct = (id: string) => {
    setSelected((prev) =>
      prev.has(id)
        ? new Map(Array.from(prev).filter(([key]) => key !== id))
        : new Map(prev).set(id, 1)
    );
  };

  const clearForm = () => {
    setSelected(new Map());
    setSelectedCustomer("");
    setOrderSuccess(false);
  };

  const handleOrder = async () => {
    setLoading(true);
    setLoading(false);
    const sales = await Promise.all(
      Array.from(selected.keys()).map(async (id) => {
        const quantity = selected.get(id);
        if (quantity) {
          return await createSale(id, quantity);
        }
      })
    );

    createOrder(
      selectedCustomer,
      sales.filter((sale) => !!sale).map((sale) => sale?.id)
    );
    setOrderSuccess(true);
  };

  const calculatedSubTotal = Array.from(selected.entries()).reduce(
    (total, [id, quantity]) => {
      const product = products.find((p) => p.id === id);
      if (product) {
        const price = product.fields["Price per unit"];
        return total + price * (quantity || 0);
      }
      return total;
    },
    0
  );

  const onCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    setSelectedCustomer(customerId);
    setOrderSuccess(false);
  };

  const onProductAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions);
    setSelected((existing) => {
      const mapped = new Map(existing);
      options.forEach((opt) => {
        mapped.set(opt.value, 1);
      });
      return mapped;
    });
    setOrderSuccess(false);
  };

  const onQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    let value: number | "" = "";
    if (e.target.value) {
      value = parseFloat(e.target.value);
      if (isNaN(value) || value < 0) {
        value = 0;
      }
    }
    setSelected((prev) => {
      const updated = new Map(prev);
      updated.set(id, value);
      return updated;
    });
    setOrderSuccess(false);
  };

  const calculatedMarkup = (calculatedSubTotal * 0.05).toFixed(2);
  const calculatedTotal = (
    calculatedSubTotal + Number(calculatedMarkup)
  ).toFixed(2);

  const OCLink = `https://opencollective.com/greens-and-beans/contribute/store-purchase-89569/checkout?interval=oneTime&amount=${calculatedTotal}&contributeAs=me`;

  return (
    <AppContainer>
      <h1>Cart</h1>
      <h2>Select customer:</h2>
      <Select value={selectedCustomer} onChange={onCustomerChange}>
        <option value="">-- Select Customer --</option>
        {customers
          .sort((a, b) =>
            a.fields["Name and Surname"].localeCompare(
              b.fields["Name and Surname"]
            )
          )
          .map((c) => (
            <option key={c.id} value={c.id}>
              {c.fields["Name and Surname"]} ({c.fields.Email})
            </option>
          ))}
      </Select>
      <h2>Order Products</h2>
      <Select onChange={onProductAdd}>
        {products
          .sort((a, b) => a.fields.Product.localeCompare(b.fields.Product))
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.fields.Product} (${p.fields["Price per unit"]} per{" "}
              {p.fields.Unit})
            </option>
          ))}
      </Select>
      {selected.size > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3>Selected Products:</h3>
          <UL>
            {Array.from(selected.keys()).map((id) => {
              const product = products.find((p) => p.id === id);
              return (
                <LI key={id}>
                  <ProductName>
                    <strong>{product?.fields.Product}</strong>
                    <Button
                      onClick={() => toggleProduct(id)}
                      style={{ marginLeft: 8 }}
                    >
                      Remove
                    </Button>
                  </ProductName>
                  <Quantity>
                    <label>Quantity ({product?.fields.Unit}):</label>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={selected.get(id)}
                      onChange={(e) => onQuantityChange(e, id)}
                      required
                    />
                  </Quantity>
                  <small
                    className={css`
                      margin-top: 8px;
                      width: 100%;
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                    `}
                  >
                    <i>
                      ${product?.fields["Price per unit"]} per (
                      {product?.fields.Unit})
                    </i>
                    <span>
                      {" "}
                      Total: $
                      {(
                        (product?.fields["Price per unit"] || 0) *
                        (selected.get(id) || 0)
                      ).toFixed(2)}
                    </span>
                  </small>
                </LI>
              );
            })}
          </UL>
        </div>
      )}
      <h3>Order Summary</h3>
      <table style={{ width: "100%", marginBottom: 16 }}>
        <tbody>
          <tr>
            <td>
              <strong>Sub-total:</strong>
            </td>
            <TDNumber>${calculatedSubTotal.toFixed(2)}</TDNumber>
          </tr>
          <tr>
            <td>
              <strong>Markup (5%):</strong>
            </td>
            <TDNumber>${calculatedMarkup}</TDNumber>
          </tr>
          <tr>
            <td>
              <strong>Total:</strong>
            </td>
            <TDNumber>${calculatedTotal}</TDNumber>
          </tr>
        </tbody>
      </table>
      <CartFooter>
        {orderSuccess && (
          <>
            <SuccessContainer>
              <P>Order placed successfully!</P>
              <P>
                <Button
                  // @ts-expect-error this works.
                  href={OCLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  as="a"
                >
                  Pay on Open Collective
                </Button>
              </P>
              <QRCode value={OCLink} />
            </SuccessContainer>
          </>
        )}
        {!orderSuccess && (
          <Button
            onClick={handleOrder}
            disabled={selected.size === 0 || !selectedCustomer || loading}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </Button>
        )}
        <Button onClick={clearForm}>Clear Form</Button>
      </CartFooter>
    </AppContainer>
  );
};

export default App;
