import { useCallback, useEffect, useState } from "react";
import { LifeBuoy, Loader2, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/utils/axios";
import { formatDateTime, getStatusColor } from "@/utils/helpers";

const STATUSES = ["open", "in_progress", "waiting_on_customer", "resolved", "closed"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState("open");
  const [drafts, setDrafts] = useState({});

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter === "all" ? "" : `?status=${filter}`;
      const response = await api.get(`/chatbot/admin/tickets${params}`);
      setTickets(response.data.data.tickets);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load support requests");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const updateTicket = async (ticket, values) => {
    setUpdating(ticket._id);
    try {
      await api.put(`/chatbot/admin/tickets/${ticket._id}`, values);
      toast.success(`${ticket.ticketNumber} updated`);
      setDrafts((current) => ({ ...current, [ticket._id]: "" }));
      await fetchTickets();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Customer Support</h1>
            <p className="text-muted-foreground mt-1">Review complaints, refunds, feedback, and escalations from Mendly Support.</p>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="waiting_on_customer">Waiting on customer</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="all">All requests</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading requests…</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20">
            <LifeBuoy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">No support requests in this view</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket._id}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{ticket.ticketNumber}</span>
                        <Badge className={getStatusColor(ticket.status)}>{ticket.status.replaceAll("_", " ")}</Badge>
                        <Badge variant={ticket.priority === "urgent" ? "destructive" : "secondary"}>{ticket.priority}</Badge>
                        <Badge variant="outline">{ticket.type.replaceAll("_", " ")}</Badge>
                      </div>
                      <h2 className="font-semibold mt-2">{ticket.subject}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{ticket.customer?.name} · {ticket.customer?.email} · {formatDateTime(ticket.createdAt)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Select value={ticket.status} onValueChange={(status) => updateTicket(ticket, { status })} disabled={updating === ticket._id}>
                        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>{STATUSES.map((status) => <SelectItem key={status} value={status}>{status.replaceAll("_", " ")}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select value={ticket.priority} onValueChange={(priority) => updateTicket(ticket, { priority })} disabled={updating === ticket._id}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>{PRIORITIES.map((priority) => <SelectItem key={priority} value={priority}>{priority}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="rounded-xl bg-muted p-4 text-sm whitespace-pre-wrap">{ticket.message}</div>
                  {(ticket.relatedOrder || ticket.relatedBooking) && (
                    <p className="text-xs text-muted-foreground">Linked to {ticket.relatedOrder ? `order #${ticket.relatedOrder._id.slice(-6).toUpperCase()}` : `repair #${ticket.relatedBooking._id.slice(-6).toUpperCase()}`}</p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <MessageSquareText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <textarea
                        className="w-full min-h-20 rounded-xl border bg-background pl-10 pr-3 py-2 text-sm"
                        placeholder="Add an update the customer can see…"
                        value={drafts[ticket._id] || ""}
                        onChange={(event) => setDrafts((current) => ({ ...current, [ticket._id]: event.target.value }))}
                      />
                    </div>
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white sm:self-end"
                      disabled={updating === ticket._id || !(drafts[ticket._id] || "").trim()}
                      onClick={() => updateTicket(ticket, { message: drafts[ticket._id], visibility: "customer" })}
                    >Send update</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SupportTickets;
