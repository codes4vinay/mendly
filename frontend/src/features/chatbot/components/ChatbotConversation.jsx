import { createElement, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  LockKeyhole,
  MessageSquareText,
  PackageSearch,
  RefreshCw,
  Send,
  ShieldCheck,
  Star,
  TicketCheck,
  Wrench,
} from "lucide-react";
import ChatbotMessage from "./ChatbotMessage";
import "./ChatbotConversation.css";

const QUICK_ACTIONS = [
  { id: "track_order", label: "Track an order", detail: "Delivery and payment status", icon: PackageSearch },
  { id: "track_repair", label: "Track a repair", detail: "Live repair stage and timeline", icon: Wrench },
  { id: "complaint", label: "Report a problem", detail: "Create a traceable complaint", icon: CircleAlert },
  { id: "feedback", label: "Share feedback", detail: "Rate your Mendly experience", icon: Star },
  { id: "my_tickets", label: "My support requests", detail: "Check your ticket updates", icon: ClipboardList },
];

const TICKET_CONFIG = {
  complaint: { type: "complaint", title: "Report a problem", subject: "Problem with my Mendly experience" },
  feedback: { type: "feedback", title: "Share feedback", subject: "Feedback for Mendly" },
  refund_request: { type: "refund_request", title: "Request a refund", subject: "Refund request" },
  return_request: { type: "return_request", title: "Request a return", subject: "Return or replacement request" },
  order_issue: { type: "order_issue", title: "Report an order issue", subject: "Issue with my order" },
  repair_issue: { type: "repair_issue", title: "Report a repair issue", subject: "Issue with my repair" },
  account_help: { type: "account_help", title: "Get account help", subject: "Account support needed" },
};

const humanStatus = (value) => String(value || "unknown").replaceAll("_", " ");
const shortId = (id) => String(id || "").slice(-6).toUpperCase();
const money = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(value || 0);
const when = (value) => value
  ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  : "Not available";

const StatusPill = ({ children, tone = "neutral" }) => (
  <span className={`support-status support-status-${tone}`}>{humanStatus(children)}</span>
);

const EmptyPanel = ({ icon: Icon, title, text, link, linkLabel }) => (
  <div className="support-empty-panel">
    <div className="support-empty-icon">{createElement(Icon)}</div>
    <strong>{title}</strong>
    <p>{text}</p>
    {link && <Link className="support-primary-link" to={link}>{linkLabel}</Link>}
  </div>
);

export const ChatbotConversation = ({
  messages,
  loading,
  error,
  supportContext,
  sendMessage,
  createTicket,
  cancelResource,
  clearConversation,
  user,
  isAuthenticated,
  isCustomer,
}) => {
  const [input, setInput] = useState("");
  const [panel, setPanel] = useState("home");
  const [ticketMode, setTicketMode] = useState("complaint");
  const [linkedRecord, setLinkedRecord] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [result, setResult] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const actionHandler = (action, record = null) => {
    if (action === "track_order") return setPanel("orders");
    if (action === "track_repair") return setPanel("repairs");
    if (action === "my_tickets") return setPanel("tickets");
    const normalized = TICKET_CONFIG[action] ? action : "complaint";
    setTicketMode(normalized);
    setLinkedRecord(record);
    setPanel("ticket_form");
  };

  const submitMessage = async (event) => {
    event.preventDefault();
    if (!input.trim() || loading) return;
    const value = input.trim();
    setInput("");
    setPanel("chat");
    await sendMessage(value);
  };

  const handleClear = async () => {
    try {
      await clearConversation();
      setPanel("home");
      setResult(null);
    } catch {
      // The hook exposes a user-facing error in the widget.
    }
  };

  const renderPanel = () => {
    if (!isAuthenticated) {
      return (
        <div className="support-signed-out">
          <div className="support-hero-icon"><LockKeyhole /></div>
          <p className="support-eyebrow">Secure customer support</p>
          <h4>Sign in to get personal help</h4>
          <p>Track your own orders and repairs, cancel eligible requests, or create a complaint with a reference number.</p>
          <Link to="/login" className="support-primary-link">Sign in securely</Link>
          <Link to="/register" className="support-secondary-link">Create an account</Link>
          <div className="support-security-note"><ShieldCheck /> We never ask for passwords, OTPs, PINs, or card details.</div>
        </div>
      );
    }

    if (panel === "chat") {
      return (
        <div className="support-chat-log">
          {messages.length === 0 && (
            <EmptyPanel
              icon={MessageSquareText}
              title="Ask Mendly Support"
              text="Ask about orders, repairs, payments, returns, account help, or a problem you need resolved."
            />
          )}
          {messages.map((message, index) => (
            <ChatbotMessage
              key={message._id || `${message.role}-${index}`}
              message={message}
              isUser={message.role === "user"}
              onAction={actionHandler}
            />
          ))}
          {loading && (
            <div className="support-typing"><span /><span /><span /><em>Mendly Support is responding</em></div>
          )}
          <div ref={messagesEndRef} />
        </div>
      );
    }

    if (!isCustomer) {
      return (
        <div className="support-signed-out">
          <div className="support-hero-icon"><Bot /></div>
          <h4>Support assistant</h4>
          <p>Customer account actions are available to customer accounts. You can still ask a general Mendly support question.</p>
          <button className="support-primary-button" onClick={() => setPanel("chat")}>Ask a question</button>
        </div>
      );
    }

    if (panel === "orders") return (
      <RecordList
        title="Your recent orders"
        records={supportContext?.orders || []}
        kind="order"
        empty={{ icon: PackageSearch, title: "No orders yet", text: "Orders you place will appear here.", link: "/marketplace", linkLabel: "Browse marketplace" }}
        onBack={() => setPanel("home")}
        onIssue={(record) => actionHandler("order_issue", record)}
        onCancel={(record) => { setCancelTarget({ kind: "order", record }); setPanel("cancel"); }}
      />
    );

    if (panel === "repairs") return (
      <RecordList
        title="Your repair bookings"
        records={supportContext?.bookings || []}
        kind="booking"
        empty={{ icon: Wrench, title: "No repairs yet", text: "Your service bookings and repair progress will appear here.", link: "/services", linkLabel: "Book a service" }}
        onBack={() => setPanel("home")}
        onIssue={(record) => actionHandler("repair_issue", record)}
        onCancel={(record) => { setCancelTarget({ kind: "booking", record }); setPanel("cancel"); }}
      />
    );

    if (panel === "tickets") return (
      <TicketList tickets={supportContext?.tickets || []} onBack={() => setPanel("home")} onCreate={() => actionHandler("complaint")} />
    );

    if (panel === "ticket_form") return (
      <TicketForm
        config={TICKET_CONFIG[ticketMode]}
        context={supportContext}
        linkedRecord={linkedRecord}
        emailVerified={supportContext?.customer?.emailVerified}
        loading={loading}
        onBack={() => setPanel("home")}
        onSubmit={async (payload) => {
          const ticket = await createTicket(payload);
          setResult({
            title: "Request registered",
            text: `Your reference number is ${ticket.ticketNumber}. You can follow updates under My support requests.`,
          });
          setPanel("result");
        }}
      />
    );

    if (panel === "cancel") return (
      <CancelPanel
        target={cancelTarget}
        loading={loading}
        onBack={() => setPanel(cancelTarget?.kind === "order" ? "orders" : "repairs")}
        onConfirm={async (reason) => {
          const outcome = await cancelResource({
            resourceType: cancelTarget.kind,
            resourceId: cancelTarget.record._id,
            reason,
          });
          setResult(outcome.outcome === "review_required"
            ? { title: "Sent for review", text: `This request needs a support agent. Ticket ${outcome.ticket.ticketNumber} has been created.` }
            : { title: "Cancellation complete", text: "The status has been updated and a confirmation was sent to your account." });
          setPanel("result");
        }}
      />
    );

    if (panel === "result") return (
      <div className="support-result-panel">
        <div className="support-success-icon"><CheckCircle2 /></div>
        <h4>{result?.title}</h4>
        <p>{result?.text}</p>
        <button className="support-primary-button" onClick={() => setPanel("home")}>Back to support</button>
      </div>
    );

    return (
      <div className="support-home">
        <p className="support-eyebrow">Hi {user?.name?.split(" ")[0] || "there"}</p>
        <h4>What can we sort out?</h4>
        <p className="support-home-copy">Choose a secure self-service option or ask a question below.</p>
        <div className="support-action-grid">
          {QUICK_ACTIONS.map(({ id, label, detail, icon: Icon }) => (
            <button type="button" key={id} onClick={() => actionHandler(id)}>
              <span className="support-action-icon">{createElement(Icon)}</span>
              <span><strong>{label}</strong><small>{detail}</small></span>
              <ChevronRight />
            </button>
          ))}
        </div>
        <button className="support-ask-button" onClick={() => setPanel("chat")}>
          <MessageSquareText /> Ask another question
        </button>
        <div className="support-security-note"><ShieldCheck /> Signed in securely. Only records from your account are shown.</div>
      </div>
    );
  };

  return (
    <div className="chatbot-conversation">
      <header className="chatbot-header">
        <div className="chatbot-brand-mark"><Bot /></div>
        <div>
          <h3>Mendly Support</h3>
          <span><i /> Online · account-safe help</span>
        </div>
        {isAuthenticated && (
          <button className="clear-btn" onClick={handleClear} title="Start a new conversation" aria-label="Start a new conversation">
            <RefreshCw />
          </button>
        )}
      </header>

      <main className="support-content">{renderPanel()}</main>

      {error && <div className="support-error"><CircleAlert /> {error}</div>}

      {isAuthenticated && (
        <form className="input-form" onSubmit={submitMessage}>
          <label htmlFor="mendly-support-input" className="sr-only">Message Mendly Support</label>
          <input
            id="mendly-support-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about an order, repair, or issue…"
            maxLength={1000}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} aria-label="Send message"><Send /></button>
        </form>
      )}
    </div>
  );
};

const RecordList = ({ title, records, kind, empty, onBack, onIssue, onCancel }) => (
  <div className="support-panel">
    <PanelTitle title={title} onBack={onBack} />
    {records.length === 0 ? <EmptyPanel {...empty} /> : (
      <div className="support-record-list">
        {records.map((record) => {
          const isOrder = kind === "order";
          const terminal = isOrder
            ? ["cancelled", "delivered"].includes(record.status)
            : ["cancelled", "completed"].includes(record.status);
          return (
            <article className="support-record-card" key={record._id}>
              <div className="support-record-top">
                <div>
                  <small>{isOrder ? "ORDER" : "REPAIR"} #{shortId(record._id)}</small>
                  <strong>{isOrder
                    ? record.items?.map((item) => item.product?.name).filter(Boolean).join(", ") || "Product order"
                    : record.service?.name || "Repair service"}</strong>
                </div>
                <StatusPill tone={terminal ? "neutral" : "active"}>{isOrder ? record.status : record.trackingStatus}</StatusPill>
              </div>
              <dl>
                <div><dt>Centre</dt><dd>{record.serviceCentre?.name || "Pending assignment"}</dd></div>
                <div><dt>{isOrder ? "Placed" : "Scheduled"}</dt><dd>{when(isOrder ? record.createdAt : record.scheduledAt)}</dd></div>
                <div><dt>Payment</dt><dd>{humanStatus(record.payment?.status || (record.isPaid ? "paid" : "pending"))}</dd></div>
                <div><dt>Total</dt><dd>{money(record.totalAmount)}</dd></div>
              </dl>
              {!isOrder && record.tracking?.timeline?.length > 0 && (
                <div className="support-latest-update">
                  <TicketCheck />
                  <span><small>Latest update</small>{record.tracking.timeline.at(-1).message}</span>
                </div>
              )}
              <div className="support-record-actions">
                <button onClick={() => onIssue(record)}>Report an issue</button>
                {!terminal && <button className="danger" onClick={() => onCancel(record)}>Cancel</button>}
              </div>
            </article>
          );
        })}
      </div>
    )}
  </div>
);

const TicketList = ({ tickets, onBack, onCreate }) => (
  <div className="support-panel">
    <PanelTitle title="My support requests" onBack={onBack} />
    {tickets.length === 0 ? (
      <EmptyPanel icon={ClipboardList} title="No support requests" text="If something goes wrong, create a request and track it here." />
    ) : (
      <div className="support-record-list">
        {tickets.map((ticket) => (
          <article className="support-ticket-card" key={ticket._id}>
            <div><small>{ticket.ticketNumber}</small><StatusPill tone={ticket.status === "open" ? "active" : "neutral"}>{ticket.status}</StatusPill></div>
            <strong>{ticket.subject}</strong>
            <p>{humanStatus(ticket.type)} · Updated {when(ticket.updatedAt)}</p>
          </article>
        ))}
      </div>
    )}
    <button className="support-primary-button" onClick={onCreate}>Create a support request</button>
  </div>
);

const TicketForm = ({ config, context, linkedRecord, emailVerified, loading, onBack, onSubmit }) => {
  const [subject, setSubject] = useState(config.subject);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [contactPreference, setContactPreference] = useState("email");
  const [relation, setRelation] = useState(linkedRecord ? `linked:${linkedRecord._id}` : "none");

  const relationOptions = useMemo(() => {
    const orders = (context?.orders || []).map((record) => ({
      value: `order:${record._id}`, label: `Order #${shortId(record._id)} · ${humanStatus(record.status)}`,
    }));
    const bookings = (context?.bookings || []).map((record) => ({
      value: `booking:${record._id}`, label: `Repair #${shortId(record._id)} · ${humanStatus(record.trackingStatus)}`,
    }));
    return [...orders, ...bookings];
  }, [context]);

  useEffect(() => {
    if (linkedRecord) {
      const isOrder = context?.orders?.some((record) => record._id === linkedRecord._id);
      setRelation(`${isOrder ? "order" : "booking"}:${linkedRecord._id}`);
    }
  }, [linkedRecord, context]);

  const submit = async (event) => {
    event.preventDefault();
    const [kind, id] = relation.split(":");
    try {
      await onSubmit({
        type: config.type,
        subject,
        message,
        rating: config.type === "feedback" ? Number(rating) : null,
        contactPreference,
        relatedOrder: kind === "order" ? id : null,
        relatedBooking: kind === "booking" ? id : null,
      });
    } catch {
      // The hook exposes a user-facing error in the widget.
    }
  };

  return (
    <div className="support-panel">
      <PanelTitle title={config.title} onBack={onBack} />
      {!emailVerified ? (
        <div className="support-warning"><LockKeyhole /><span><strong>Email verification required</strong>Verify your account before creating a support request.</span></div>
      ) : (
        <form className="support-form" onSubmit={submit}>
          <label>Subject<input value={subject} onChange={(e) => setSubject(e.target.value)} minLength={4} maxLength={120} required /></label>
          {config.type === "feedback" && (
            <fieldset>
              <legend>Your rating</legend>
              <div className="support-rating">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button type="button" key={value} className={value <= rating ? "selected" : ""} onClick={() => setRating(value)} aria-label={`${value} stars`}><Star /></button>
                ))}
              </div>
            </fieldset>
          )}
          <label>Link to an order or repair (optional)
            <select value={relation} onChange={(e) => setRelation(e.target.value)}>
              <option value="none">No linked record</option>
              {relationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>What happened?<textarea value={message} onChange={(e) => setMessage(e.target.value)} minLength={10} maxLength={2000} rows={5} placeholder="Include the outcome you need. Do not include passwords, OTPs, PINs, or card details." required /></label>
          <label>Preferred follow-up
            <select value={contactPreference} onChange={(e) => setContactPreference(e.target.value)}>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
          </label>
          <button className="support-primary-button" disabled={loading} type="submit">{loading ? "Submitting…" : "Submit securely"}</button>
        </form>
      )}
    </div>
  );
};

const CancelPanel = ({ target, loading, onBack, onConfirm }) => {
  const [reason, setReason] = useState("");
  if (!target) return null;
  return (
    <div className="support-panel">
      <PanelTitle title={`Cancel ${target.kind === "order" ? "order" : "repair"}`} onBack={onBack} />
      <div className="support-warning"><CircleAlert /><span><strong>Confirmation required</strong>Eligible unpaid requests cancel immediately. Paid or in-progress requests go to a support agent for review.</span></div>
      <form className="support-form" onSubmit={async (event) => {
        event.preventDefault();
        try { await onConfirm(reason); } catch { /* Error is shown by the parent hook. */ }
      }}>
        <div className="support-cancel-target">{target.kind === "order" ? "Order" : "Repair"} #{shortId(target.record._id)}<StatusPill>{target.record.status}</StatusPill></div>
        <label>Reason for cancellation<textarea value={reason} onChange={(e) => setReason(e.target.value)} minLength={5} maxLength={500} rows={4} required /></label>
        <button className="support-danger-button" disabled={loading || reason.trim().length < 5} type="submit">{loading ? "Processing…" : "Confirm cancellation"}</button>
      </form>
    </div>
  );
};

const PanelTitle = ({ title, onBack }) => (
  <div className="support-panel-title">
    <button onClick={onBack} aria-label="Back"><ArrowLeft /></button>
    <div><small>MENDLY SUPPORT</small><h4>{title}</h4></div>
  </div>
);

export default ChatbotConversation;
