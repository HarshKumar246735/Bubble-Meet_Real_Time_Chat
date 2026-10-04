import "../css/FlyingPeople.css";

const people = [
    {
        id: 1,
        image: "/images/people/boy1.jpg",
        className: "fly-person-1"
    },
    {
        id: 2,
        image: "/images/people/girl1.jpg",
        className: "fly-person-2"
    },
    {
        id: 3,
        image: "/images/people/boy2.jpg",
        className: "fly-person-3"
    },
    {
        id: 4,
        image: "/images/people/girl2.jpg",
        className: "fly-person-4"
    },
    {
        id: 5,
        image: "/images/people/boy3.jpg",
        className: "fly-person-5"
    },
    {
        id: 6,
        image: "/images/people/girl3.jpg",
        className: "fly-person-6"
    }
];

const FlyingPeople = () => {
    return (
        <div className="flying-people">

            {people.map((person) => (

                <div
                    key={person.id}
                    className={`flying-person ${person.className}`}
                >

                    <div className="avatar-glow"></div>

                    <div className="person-avatar">

                        <img
                            src={person.image}
                            alt=""
                        />

                        <span className="online-dot"></span>

                    </div>

                </div>

            ))}

        </div>
    );
};

export default FlyingPeople;