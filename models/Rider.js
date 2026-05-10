import React,{
  useEffect,
  useState
} from "react";

import styled from "styled-components";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "http://localhost:5000";

// ================= STYLES =================

const Page = styled.div`
  min-height:100vh;
  background:#f4f7fb;
  font-family:Inter,sans-serif;
`;

const Header = styled.div`
  height:70px;
  background:linear-gradient(to right,#2563eb,#4f46e5);
  display:flex;
  align-items:center;
  padding:0 18px;
  color:white;
`;

const Logo = styled.img`
  width:42px;
  height:42px;
  border-radius:10px;
  background:white;
  padding:3px;
  margin-right:10px;
`;

const Brand = styled.h1`
  margin:0;
  font-size:18px;
`;

const Welcome = styled.p`
  margin:0;
  font-size:12px;
  opacity:0.9;
`;

const Logout = styled.button`
  margin-left:auto;
  background:#ef4444;
  color:white;
  border:none;
  padding:8px 12px;
  border-radius:8px;
  font-size:13px;
  font-weight:600;
  cursor:pointer;
`;

const Wrapper = styled.div`
  max-width:1000px;
  margin:auto;
  padding:16px;
`;

const Title = styled.h2`
  font-size:18px;
  margin-bottom:14px;
`;

const Orders = styled.div`
  display:grid;
  gap:14px;
`;

const Card = styled.div`
  background:white;
  border-radius:14px;
  padding:14px;
  box-shadow:0 2px 10px rgba(0,0,0,0.05);
`;

const Row = styled.div`
  margin-bottom:8px;
  font-size:14px;
`;

const Status = styled.span`
  padding:4px 10px;
  border-radius:999px;
  font-size:11px;
  font-weight:700;
  background:#dbeafe;
  color:#1d4ed8;
`;

const ButtonGroup = styled.div`
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  margin-top:12px;
`;

const Btn = styled.button`
  background:${props=>props.color || "#2563eb"};
  color:white;
  border:none;
  padding:8px 12px;
  border-radius:8px;
  font-size:13px;
  font-weight:700;
  cursor:pointer;
`;

const Empty = styled.div`
  text-align:center;
  padding:30px;
  color:#6b7280;
`;

// ================= COMPONENT =================

export default function Rider(){

  const [orders,setOrders] =
    useState([]);

  const [user,setUser] =
    useState(null);

  const [loading,setLoading] =
    useState(true);

  // ================= LOAD =================

  useEffect(()=>{

    fetchUser();

    fetchOrders();

  },[]);

  // ================= FETCH USER =================

  async function fetchUser(){

    try{

      const token =
        localStorage.getItem(
          "token"
        );

      const res =
        await fetch(

          `${API_BASE}/api/rider/me`,

          {

            headers:{

              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const data =
        await res.json();

      setUser(data);

    }catch(err){

      console.log(err);
    }
  }

  // ================= FETCH ORDERS =================

  async function fetchOrders(){

    try{

      const token =
        localStorage.getItem(
          "token"
        );

      const res =
        await fetch(

          `${API_BASE}/api/orders`,

          {

            headers:{

              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const data =
        await res.json();

      setOrders(data);

    }catch(err){

      console.log(err);

    }finally{

      setLoading(false);
    }
  }

  // ================= UPDATE ORDER =================

  async function updateOrder(
    id,
    status
  ){

    try{

      const token =
        localStorage.getItem(
          "token"
        );

      await fetch(

        `${API_BASE}/api/orders/${id}`,

        {

          method:"PUT",

          headers:{

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body:JSON.stringify({

            riderId:user._id,

            status
          })
        }
      );

      fetchOrders();

    }catch(err){

      console.log(err);

      alert(
        "Action failed"
      );
    }
  }

  // ================= LOGOUT =================

  function logout(){

    localStorage.clear();

    window.location.href =
      "/login";
  }

  // ================= UI =================

  return(

    <Page>

      <Header>

        <Logo
          src="/logo.png"
          alt="logo"
        />

        <div>

          <Brand>
            MonniDrop Rider
          </Brand>

          <Welcome>

            {
              user?.name

              ?

              `Hi, ${user.name}`

              :

              "Loading rider..."
            }

          </Welcome>

        </div>

        <Logout onClick={logout}>
          Logout
        </Logout>

      </Header>

      <Wrapper>

        <Title>
          Orders
        </Title>

        {

          loading

          ?

          (

            <Empty>
              Loading...
            </Empty>

          )

          :

          orders.length === 0

          ?

          (

            <Empty>
              No orders
            </Empty>

          )

          :

          (

            <Orders>

              {

                orders.map((o)=>(

                  <Card key={o._id}>

                    <Row>
                      <strong>Customer:</strong>{" "}
                      {o.customer?.name}
                    </Row>

                    <Row>
                      <strong>Rider:</strong>{" "}
                      {o.rider?.name || "No rider"}
                    </Row>

                    <Row>
                      <strong>Pickup:</strong>{" "}
                      {o.pickupLocation}
                    </Row>

                    <Row>
                      <strong>Dropoff:</strong>{" "}
                      {o.dropoffLocation}
                    </Row>

                    <Row>
                      <strong>Status:</strong>{" "}

                      <Status>
                        {o.status}
                      </Status>

                    </Row>

                    <ButtonGroup>

                      {

                        o.status === "pending" && (

                          <Btn
                            color="#2563eb"
                            onClick={()=>
                              updateOrder(
                                o._id,
                                "assigned"
                              )
                            }
                          >
                            Accept Order
                          </Btn>
                        )
                      }

                      {

                        o.status === "assigned" && (

                          <Btn
                            color="#7c3aed"
                            onClick={()=>
                              updateOrder(
                                o._id,
                                "picked"
                              )
                            }
                          >
                            Item Picked
                          </Btn>
                        )
                      }

                      {

                        o.status === "picked" && (

                          <Btn
                            color="#f59e0b"
                            onClick={()=>
                              updateOrder(
                                o._id,
                                "delivering"
                              )
                            }
                          >
                            Start Delivery
                          </Btn>
                        )
                      }

                      {

                        o.status === "delivering" && (

                          <Btn
                            color="#10b981"
                            onClick={()=>
                              updateOrder(
                                o._id,
                                "delivered"
                              )
                            }
                          >
                            Delivered
                          </Btn>
                        )
                      }

                    </ButtonGroup>

                  </Card>
                ))
              }

            </Orders>
          )
        }

      </Wrapper>

    </Page>
  );
}