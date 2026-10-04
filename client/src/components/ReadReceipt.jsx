import "../css/ReadReceipt.css";

const ReadReceipt = ({ message }) => {
    if (!message) {
        return null;
    }

    if (message.isRead || message.readAt) {
        return (
            <span
                className="read-tick read-tick-read"
                title="Read"
            >
                ✓✓
            </span>
        );
    }

    return (
        <span
            className="read-tick read-tick-unread"
            title="Unread"
        >
            ✓
        </span>
    );
};

export default ReadReceipt;