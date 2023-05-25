import { GetServerSideProps } from "next";
import Dashboard from "..";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";


type SessionProps = {
  session: Session | null, 
}

export default function Menu({session}:SessionProps){
  
    return(
       <Dashboard auth={session}>
        <h1>Teste</h1>

       </Dashboard>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);

    if (!session) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    return {
      props: {
        session,   
      }
    };
  };