terraform {
  required_version = "= 0.11.6"
  
  backend "local" {
    path = "/tmp/vpc_example.state"
  }
}
