import {
  Form,
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  Outlet,
  useLoaderData,
  useNavigation,
  NavLink,
  useSubmit,
} from "@remix-run/react";
import appStylesHref from "./app.css";
import {
  ActionFunction,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useEffect } from "react";
import { getContacts, createEmptyContact } from "./data";

export const links = () => [{ rel: "stylesheet", href: appStylesHref }];

export const action: ActionFunction = async () => {
  const contact = await createEmptyContact();
  json({ contact });
  return redirect(`/contacts/${contact.id}/edit`);
};

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q });
};

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).get("q");
  useEffect(() => {
    const searchField = document.getElementById("q") as HTMLInputElement;
    searchField instanceof HTMLInputElement
      ? (searchField.value = q || "")
      : null;
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form
              id="search-form"
              role="search"
              onChange={(event) => {
                const isFirstSearch = q === null;
                submit(event.currentTarget, { replace: !isFirstSearch });
              }}
            >
              <input
                id="q"
                aria-label="Search contacts"
                className={searching ? "searching contacts" : ""}
                defaultValue={q || ""}
                placeholder="Search"
                type="search"
                name="q"
              />
              <div id="search-spinner" aria-hidden hidden={!searching} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            <ul>
              <li>
                <NavLink to={`/contacts/1`}>Your Name</NavLink>
              </li>
              <li>
                <NavLink to={`/contacts/2`}>Your Friend</NavLink>
              </li>
            </ul>
            {contacts?.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive ? "active" : isPending ? "pending" : ""
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {contact.favorite ? <span>★</span> : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div
          className={
            navigation.state === "loading" && !searching ? "loading" : ""
          }
          id="detail"
        >
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
