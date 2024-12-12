import PeerPage from "./peer/peer";
import { getAccessToken } from "@auth0/nextjs-auth0";

export default async function Home() {
  // const { accessToken } = await getAccessToken();
  const accessToken =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ild1Z0pxcGItV1lBcnk1WUV5YmFQdyJ9.eyJpc3MiOiJodHRwczovL2Rldi1wYWVtcW0wajg0ZTJ3YXZiLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDExMzM0OTI5MjMzOTg3NDcxNDM3OCIsImF1ZCI6WyJodHRwOi8vbG9jYWxob3N0OjUwMDAvYXBpIiwiaHR0cHM6Ly9kZXYtcGFlbXFtMGo4NGUyd2F2Yi51cy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzMzOTIzNjAzLCJleHAiOjE3MzQwMTAwMDMsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhenAiOiJsTmNuMFZmZE1EdXl2bHNIaDk1SVR1M01mTmFPVUVDaiJ9.ZEq6kgf2o2F57i35u1icGrDBz7Q_MdxQ_Avf6mRBiwWZj9C16wSy7-QrAKx01CwwNtvCgPJjkjIfGXtBsSR1OuIzCfhuh6Q6aXJH64sdvhs9duo5aSUFqXe2P0TXQUwNROW55Uiow_s0Mp7VnwBZ31lRSB3ycLVqbKmgvMaKvDDYZ5nOPpPbCbc3S_Si7FzKdCQgYKfBzM8AunleK13L2USSSyjm5Z0xEv03raj5gOs-UEcUzs-fiGeLzwdYN3Q1chAFdSRr3eb1ZFfcbnY-01PIo18outFTk9SdC3nJZu62tyeMAU8bZbA0bXowwhCk-ob6YoKiHHKp7JOILa5mew";
  const res = await fetch(`http://localhost:5000/api/authorized`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  console.log(await res.text());
  return (
    <div>
      <PeerPage />
    </div>
  );
}
