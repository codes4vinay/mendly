import { format } from "date-fns";

export const formatDate = (date) => {
    return format(new Date(date), "dd MMM yyyy");
};

export const formatDateTime = (date) => {
    return format(new Date(date), "dd MMM yyyy, hh:mm a");
};

export const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(price);
};

export const getStatusColor = (status) => {
    const colors = {
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
        delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        refunded: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
};

export const truncate = (text, length = 100) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
};