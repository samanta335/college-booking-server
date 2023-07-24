const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wvw2zcx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const userCollection = client.db("collegeBooking").collection("users");
    const cardCollection = client
      .db("collegeBooking")
      .collection("collegeCard");
    const collegeCollection = client
      .db("collegeBooking")
      .collection("allCollege");
    const admissionCollection = client
      .db("collegeBooking")
      .collection("admission");
    const reviewCollection = client.db("collegeBooking").collection("reviews");

    app.post("/users", async (req, res) => {
      const user = req.body;

      const query = { email: user.email };
      const existUser = await userCollection.findOne(query);

      if (existUser) {
        return res.send({ message: "user already exist" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    app.patch("/users", async (req, res) => {
      const body = req.body;
      const updateDoc = {
        $set: {
          email: body.email,
          displayName: body.name,
        },
      };
      const result = await userCollection.updateOne(updateDoc);
      res.send(result);
    });
    app.get("/collegeCard", async (req, res) => {
      const result = await cardCollection.find().toArray();
      res.send(result);
    });
    app.get("/collegeCard/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cardCollection.findOne(query);
      res.send(result);
    });

    app.get("/allCollege", async (req, res) => {
      const result = await collegeCollection.find().toArray();
      res.send(result);
    });
    app.get("/allCollege/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await collegeCollection.findOne(query);
      res.send(result);
    });

    app.post("/admissionCollege", async (req, res) => {
      const body = req.body;
      const result = await admissionCollection.insertOne(body);
      res.send(result);
    });
    app.get("/admission/:email", async (req, res) => {
      const result = await admissionCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });
    app.post("/review", async (req, res) => {
      const body = req.body;
      const result = await reviewCollection.insertOne(body);
      res.send(result);
    });
    app.get("/review", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    const indexKeys = { name: 1 };
    const indexOptions = { name: "searchName" };

    const result = await cardCollection.createIndex(indexKeys, indexOptions);

    app.get("/nameSearch/:text", async (req, res) => {
      const searchName = req.params.text;
      const result = await cardCollection
        .find({
          $or: [
            {
              name: { $regex: searchName, $options: "i" },
            },
          ],
        })
        .toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hi lets book ");
});

app.listen(port, () => {
  console.log(`college book is on ${port}`);
});
