resource "aws_instance" "ec2_example" {
  ami           = "ami-5652ce39"
  instance_type = "t2.micro"

  tags {
    Name = "example_ec2_instance_no_changes"
    ExtraAttribute = "ThisIsAnExtraAttribute"
  }
}
