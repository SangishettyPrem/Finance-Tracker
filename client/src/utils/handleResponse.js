import toast from "react-hot-toast"

export const handleSuccessResponse = (message) => {
    toast.success(message || "Operation successful!", {
        position: "top-right",
        duration: 3000,
        reverseOrder: false

    });
}

export const handleErrorResponse = (message) => {
    toast.error(message || "Something went wrong!", {
        position: "top-right",
        reverseOrder: false
    });
}