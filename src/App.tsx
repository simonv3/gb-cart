import React, { useEffect, useState } from "react";
import {
  createOrder,
  createSale,
  fetchCustomers,
  fetchProducts,
} from "./airtableApi";

import QRCode from "react-qr-code";
import { css } from "@emotion/css";
import Autocomplete, { AutocompleteItem } from "./components/Autocomplete";
import {
  AppContainer,
  UL,
  LI,
  ProductName,
  Button,
  Quantity,
  Input,
  TDNumber,
  CartFooter,
  SuccessContainer,
  P,
  Section,
} from "./components/components";

const App: React.FC = () => {
  const [loadingFromAirtable, setLoadingFromAirtable] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Map<string, number | "">>(new Map());
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<AutocompleteItem>();

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .then(fetchCustomers)
      .then(setCustomers)
      .finally(() => setLoadingFromAirtable(false));
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
    setSelectedCustomer(undefined);
    setOrderSuccess(false);
  };

  const handleOrder = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer.");
      return;
    }
    setLoading(true);
    const sales = await Promise.all(
      Array.from(selected.keys()).map(async (id) => {
        const quantity = selected.get(id);
        if (quantity) {
          return await createSale(id, quantity);
        }
      })
    );

    createOrder(
      selectedCustomer.id,
      sales.filter((sale) => !!sale).map((sale) => sale?.id)
    );
    setOrderSuccess(true);
    setLoading(false);
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

  const onProductAdd = (value?: AutocompleteItem) => {
    if (!value) return;
    setSelected((existing) => {
      const mapped = new Map(existing);
      mapped.set(value.id, 1);
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

  if (loadingFromAirtable) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        Loading...
      </div>
    );
  }

  return (
    <AppContainer>
      <h1>Cart</h1>

      <Section>
        <h2>Select customer:</h2>

        <Autocomplete
          label="Customer"
          items={customers
            .map((c) => ({
              id: c.id,
              name: c.fields["Name and Surname"],
            }))
            .filter((c) => !!c.name && c.name !== "Unaccounted")}
          selected={selectedCustomer}
          onSelectChange={setSelectedCustomer}
        />
      </Section>
      <Section>
        <h2>Order Products</h2>

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
                        &#128465; Remove
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
                        ${product?.fields["Price per unit"].toFixed(2)} per (
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
        <Autocomplete
          label="Choose a product"
          items={products.map((c) => ({
            id: c.id,
            name: `${c.fields.Product} ($${c.fields["Price per unit"].toFixed(
              2
            )} per ${c.fields.Unit})`,
          }))}
          selected={undefined}
          onSelectChange={onProductAdd}
        />
      </Section>
      {/* <Select onChange={onProductAdd}>
        {products
          .sort((a, b) => a.fields.Product.localeCompare(b.fields.Product))
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.fields.Product} (${p.fields["Price per unit"].toFixed(2)} per{" "}
              {p.fields.Unit})
            </option>
          ))}
      </Select> */}
      <Section>
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
      </Section>
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
            type="button"
            onClick={handleOrder}
            disabled={
              selected.size === 0 ||
              !selectedCustomer ||
              loading ||
              calculatedTotal === "0.00"
            }
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
