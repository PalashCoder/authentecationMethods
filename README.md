<h1>This Project shows the security level uses using Node.js</h1>
<h3>There are total 6 levels</h3>
<h4><ul>
<li>Level 1: Only Localy authentication where only Username password have to resigter and it stores in local machine. </li>
<li>Level 2: Where we use the mongoose-encryption and the password stores locally but have a little layer of encryption in it.</li>
<li>Level 3: Here we uses the md5 Hash generator where the hash code of password are genarated to make the authentication more secure.</li>
<li>Level 4: bcrypt is uses here where the password is stored after making hash but we use multiple rounds of non similar salting to make it more secure</li>
<li>Level 5: here we use the passport for more encryption , passport basically makes the password string more large more hash generated and salted string. and the salt also stores as a hashcode. and session is also introduced which will store cookie to local client</li>
<li>Level 6: Here the whole work of encryption, validation and authentecation is done by third-party trusted sources like Google, Facebook like that. </li>
</ul></h4>