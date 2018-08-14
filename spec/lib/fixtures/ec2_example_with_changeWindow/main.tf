resource "aws_instance" "ec2_example" {
  ami           = "ami-f5bcb21e"
  instance_type = "t2.micro"

  tags {
    Name = "example_ec2_instance"
  }
}
