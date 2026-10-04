import "../css/MessageReactions.css";

const MessageReactions = ({
    reactions = {},
    userReaction = null
}) => {

    const entries =
        Object.entries(
            reactions
        );

    if (!entries.length) {
        return null;
    }

    return (
        <div className="message-reactions">

            {entries.map(
                ([emoji, count]) => (

                    <span
                        key={emoji}
                        className={
                            `message-reaction ${
                                userReaction === emoji
                                    ? "my-reaction"
                                    : ""
                            }`
                        }
                    >

                        <span className="reaction-emoji">
                            {emoji}
                        </span>

                        <span className="reaction-count">
                            {count}
                        </span>

                    </span>
                )
            )}

        </div>
    );
};

export default MessageReactions;