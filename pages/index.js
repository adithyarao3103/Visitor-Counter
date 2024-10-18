
export default function Home() {
return null;
}

export async function getServerSideProps() {
return {
    redirect: {
    destination: 'https://github.com/adithyarao3103', // Replace with your repo URL
    permanent: false,
    },
};
}